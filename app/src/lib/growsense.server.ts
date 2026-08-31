// GrowSense server engine: device queries, the IoT simulator, and the
// agronomy insight engine. Server-only (imported exclusively from
// server functions / server routes).
import { bindings } from "./bindings.server";

export type Reading = {
  ts: number;
  soil_moisture: number;
  temperature: number;
  humidity: number;
  light: number;
};

export type Device = {
  id: string;
  name: string;
  crop: string;
  location: string;
  api_key: string;
  is_demo: number;
  incident: string | null;
};

export type MetricStatus = "ok" | "watch" | "critical";

export type DeviceSummary = {
  device: Device;
  latest: Reading | null;
  status: MetricStatus;
  headline: string;
};

// Crops get slightly different ideal bands; this is the "agronomy" layer.
const CROP_BANDS: Record<string, { soil: [number, number]; temp: [number, number]; humidity: [number, number]; light: [number, number] }> = {
  tomato: { soil: [45, 70], temp: [18, 27], humidity: [50, 70], light: [350, 800] },
  basil: { soil: [50, 75], temp: [18, 26], humidity: [55, 75], light: [300, 700] },
  lettuce: { soil: [50, 72], temp: [14, 21], humidity: [55, 75], light: [200, 500] },
  pepper: { soil: [40, 65], temp: [20, 29], humidity: [50, 70], light: [350, 800] },
  monstera: { soil: [45, 65], temp: [18, 27], humidity: [60, 80], light: [150, 450] },
};

const DEFAULT_BANDS = CROP_BANDS.monstera;

function bandsFor(crop: string) {
  return CROP_BANDS[crop.toLowerCase()] ?? DEFAULT_BANDS;
}

// ---------------------------------------------------------------- simulator

// Deterministic pseudo-random from a seed, so a tick is reproducible.
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function prevTs(ts: number): number {
  return ts;
}

function simulateReading(prev: Reading | null, ts: number, seed: number, incident: string | null): Reading {
  const hour = new Date(ts).getUTCHours();
  const dayFactor = Math.sin(((hour - 6) / 24) * Math.PI * 2); // daylight curve
  const base: Omit<Reading, "ts"> = {
    soil_moisture: 58 + noise(seed) * 4 - 3,
    temperature: 21 + dayFactor * 4 + noise(seed + 1) * 1.5,
    humidity: 62 - dayFactor * 10 + noise(seed + 2) * 5,
    light: Math.max(0, 520 * Math.max(0, dayFactor) + noise(seed + 3) * 60),
  };
  if (prev) {
    // readings drift from the previous value; makes charts look physical
    // per-device phase offset so the demo devices dry out on different schedules
    const phase = (Math.floor(seed / 1000) * 0.37) % 1;
    const target = incident === "drought" ? 24 + 28 * (0.5 + 0.5 * Math.sin(((ts / (12 * 3600e3)) + phase) * Math.PI * 2)) : 58;
    const reversion = prevTs(ts) - prev.ts > 3600e3 ? 0.25 : 0.06;
    base.soil_moisture = prev.soil_moisture + (target - prev.soil_moisture) * reversion + noise(seed + 4) * 1.4 - 0.25;
    base.temperature = prev.temperature * 0.9 + base.temperature * 0.1;
    base.humidity = prev.humidity * 0.9 + base.humidity * 0.1;
    base.light = base.light;
  }
  if (incident === "heatwave") base.temperature += 7;
  if (incident === "dark_shelf") base.light = Math.max(20, base.light * 0.25);
  return {
    ts,
    soil_moisture: Math.min(95, Math.max(5, base.soil_moisture)),
    temperature: Math.min(45, Math.max(2, base.temperature)),
    humidity: Math.min(95, Math.max(15, base.humidity)),
    light: Math.min(1200, Math.max(0, base.light)),
  };
}

// Seed three demo devices with 48h of history. Idempotent; only runs when
// the devices table is empty.
export async function ensureSeeded(): Promise<void> {
  try {
    await seedUnsafe();
  } catch (e) {
    console.error("seed failed (will retry on next request)", e);
  }
}

async function seedUnsafe(): Promise<void> {
  const { DB } = bindings();
  if (!DB) return;
  const row = await DB.prepare("SELECT COUNT(*) AS n FROM devices WHERE is_demo = 1").first<{ n: number }>();
  if ((row?.n ?? 0) >= 3) return;

  const now = Date.now();
  const demo = [
    { id: "demo-tom-a1", name: "Tomato Bed A1", crop: "tomato", location: "Greenhouse; Row 1", incident: null as string | null },
    { id: "demo-bas-b2", name: "Basil Shelf B2", crop: "basil", location: "Indoor shelf, south window", incident: "drought" },
    { id: "demo-mon-c3", name: "Monstera Corner", crop: "monstera", location: "Living room, north wall", incident: null as string | null },
  ];
  for (let i = 0; i < demo.length; i++) {
    const d = demo[i];
    const res = await DB.prepare(
      "INSERT OR IGNORE INTO devices (id, name, crop, location, api_key, is_demo, incident, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)",
    )
      .bind(d.id, d.name, d.crop, d.location, `gs_demo_${d.id}`, d.incident, now)
      .run();
    if (!res.meta.changes) continue; // another isolate already seeded this device
    const stmt = DB.prepare(
      "INSERT INTO readings (device_id, ts, soil_moisture, temperature, humidity, light) VALUES (?, ?, ?, ?, ?, ?)",
    );
    // 96 readings at 30-minute intervals = 48h of history
    const batch = [];
    let prev: Reading | null = null;
    for (let k = 96; k >= 0; k--) {
      const ts = now - k * 30 * 60 * 1000;
      const r = simulateReading(prev, ts, i * 1000 + k, d.incident);
      batch.push(d.id, r.ts, r.soil_moisture, r.temperature, r.humidity, r.light);
      prev = r;
    }
    // one multi-row insert per 6 readings keeps the SQL under limits
    for (let b = 0; b < batch.length; b += 60) {
      const slice = batch.slice(b, b + 60);
      const rows = [];
      for (let r = 0; r < slice.length / 6; r++) rows.push("(?, ?, ?, ?, ?, ?)");
      await DB.prepare(
        `INSERT INTO readings (device_id, ts, soil_moisture, temperature, humidity, light) VALUES ${rows.join(", ")}`,
      )
        .bind(...slice)
        .run();
    }
  }
}

// Advance every demo device by one reading. Called from the dashboard's live
// poll; throttled so concurrent tabs don't stampede.
let lastTick = 0;
export async function tickSimulator(): Promise<boolean> {
  const { DB } = bindings();
  if (!DB) return false;
  const now = Date.now();
  if (now - lastTick < 60000) return false; // simulated devices post once a minute
  lastTick = now;
  await ensureSeeded();
  // occasional housekeeping: bound table growth (runs at most once per tick)
  if (noise(now / 60000) < 0.05) {
    await DB.prepare("DELETE FROM readings WHERE ts < ?").bind(now - 14 * 24 * 3600e3).run();
  }
  const devices = await DB.prepare("SELECT * FROM devices WHERE is_demo = 1").all<Device & { id: string }>();
  for (let i = 0; i < devices.results.length; i++) {
    const d = devices.results[i];
    const prevRow = await DB.prepare(
      "SELECT ts, soil_moisture, temperature, humidity, light FROM readings WHERE device_id = ? ORDER BY ts DESC LIMIT 1",
    )
      .bind(d.id)
      .first<Reading>();
    const r = simulateReading(prevRow ?? null, now, i * 1000 + Math.floor(now / 30000), d.incident);
    await DB.prepare(
      "INSERT INTO readings (device_id, ts, soil_moisture, temperature, humidity, light) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(d.id, r.ts, r.soil_moisture, r.temperature, r.humidity, r.light)
      .run();
    // run the same analysis the ingest path uses, and record critical findings
    // in the alert ledger (deduped: one line per device+metric per 6 hours)
    const history = await recentReadings(d.id, 13);
    const insight = analyze(d, history);
    for (const [metric, verdict] of Object.entries(insight.metrics)) {
      if (verdict.status === "ok" || !verdict.message) continue;
      const window = verdict.status === "critical" ? 6 * 3600e3 : 3 * 3600e3;
      const recent = await DB.prepare(
        "SELECT COUNT(*) AS n FROM alerts WHERE device_id = ? AND metric = ? AND severity = ? AND ts > ?",
      )
        .bind(d.id, metric, verdict.status, now - window)
        .first<{ n: number }>();
      if ((recent?.n ?? 0) > 0) continue;
      await DB.prepare("INSERT INTO alerts (device_id, ts, severity, metric, message) VALUES (?, ?, ?, ?, ?)")
        .bind(d.id, now, verdict.status, metric, verdict.message)
        .run();
    }
  }
  return true;
}

// ---------------------------------------------------------------- analysis

type MetricVerdict = { status: MetricStatus; message: string | null };

function verdict(value: number, band: [number, number], unit: string, lowAdvice: string, highAdvice: string): MetricVerdict {
  const [lo, hi] = band;
  if (value < lo - (lo * 0.12 + 2)) return { status: "critical", message: `${value.toFixed(0)}${unit}; well below the ${lo}–${hi}${unit} range. ${lowAdvice}` };
  if (value < lo) return { status: "watch", message: `Drifting low (${value.toFixed(0)}${unit}, healthy is ${lo}–${hi}${unit}). ${lowAdvice}` };
  if (value > hi + (hi * 0.12 + 2)) return { status: "critical", message: `${value.toFixed(0)}${unit}; well above the ${lo}–${hi}${unit} range. ${highAdvice}` };
  if (value > hi) return { status: "watch", message: `Creeping high (${value.toFixed(0)}${unit}, healthy is ${lo}–${hi}${unit}). ${highAdvice}` };
  return { status: "ok", message: null };
}

export type Insight = {
  status: MetricStatus;
  headline: string;
  details: string[];
  metrics: Record<"soil_moisture" | "temperature" | "humidity" | "light", MetricVerdict>;
};

export function analyze(device: Device, readings: Reading[]): Insight {
  if (readings.length === 0) {
    return {
      status: "ok",
      headline: "Registered and waiting for its first reading.",
      details: [
        "No sensor data has arrived yet. Point your device at /api/ingest with this device's API key, and the notebook will fill in automatically.",
      ],
      metrics: {
        soil_moisture: { status: "ok", message: null },
        temperature: { status: "ok", message: null },
        humidity: { status: "ok", message: null },
        light: { status: "ok", message: null },
      },
    };
  }
  const bands = bandsFor(device.crop);
  const latest = readings[readings.length - 1];
  // At night (20:00-06:00 UTC) low light is expected, not a problem: only
  // judge the light metric against its band during daytime hours.
  const hourUtc = new Date(latest.ts).getUTCHours();
  const daylight = hourUtc >= 6 && hourUtc < 20;
  const metrics = {
    soil_moisture: verdict(
      latest.soil_moisture,
      bands.soil,
      "%",
      "Water soon; check drainage too, soggy roots are the usual follow-up problem.",
      "Let the topsoil dry before the next watering.",
    ),
    temperature: verdict(
      latest.temperature,
      bands.temp,
      "°C",
      "Move warmth away or insulate overnight; seedlings feel cold nights first.",
      "Improve airflow or shade during peak sun.",
    ),
    humidity: verdict(
      latest.humidity,
      bands.humidity,
      "%",
      "Group plants or add a humidity tray.",
      "Increase ventilation to discourage mildew.",
    ),
    light: daylight
      ? verdict(
          latest.light,
          bands.light,
          " lx",
          "Shift closer to the window or add a grow light for 4–6h.",
          "Diffuse direct sun with a sheer curtain.",
        )
      : { status: "ok" as MetricStatus, message: null },
  };

  const order: MetricStatus[] = ["critical", "watch", "ok"];
  const status = order[
    Math.min(
      ...Object.values(metrics).map((m) => order.indexOf(m.status)),
    )
  ];

  const cropName = device.crop.charAt(0).toUpperCase() + device.crop.slice(1);
  const headlineMap: Record<MetricStatus, string> = {
    ok: `${cropName} is thriving; all readings inside the healthy band.`,
    watch: `${cropName} needs a small adjustment today.`,
    critical: `${cropName} needs attention now.`,
  };

  // Trend over the last 12 readings; the window is computed from the actual
  // timestamps so the wording stays truthful whatever the cadence.
  let trendLine: string | null = null;
  if (readings.length >= 12) {
    const first = readings[readings.length - 12];
    const drop = first.soil_moisture - latest.soil_moisture;
    const spanMin = Math.max(1, Math.round((latest.ts - first.ts) / 60000));
    const span = spanMin >= 90 ? `${(spanMin / 60).toFixed(spanMin % 60 === 0 ? 0 : 1)} hours` : `${spanMin} minutes`;
    if (drop > 8) trendLine = `Soil moisture fell ${drop.toFixed(0)} points over the last ${span}; the soil is drying faster than usual.`;
    else if (drop < -8) trendLine = `Soil moisture rose ${Math.abs(drop).toFixed(0)} points over the last ${span}; recent watering is still settling.`;
  }

  const details = Object.values(metrics)
    .map((m) => m.message)
    .filter((m): m is string => m !== null);
  if (trendLine) details.unshift(trendLine);
  if (details.length === 0) details.push("No action needed. Check back after the next reading.");

  return { status, headline: headlineMap[status], details, metrics };
}

// ---------------------------------------------------------------- queries

export async function listDevices(): Promise<Device[]> {
  const { DB } = bindings();
  if (!DB) return [];
  const res = await DB.prepare("SELECT * FROM devices ORDER BY created_at ASC").all<Device>();
  return res.results;
}

export async function recentReadings(deviceId: string, limit = 200): Promise<Reading[]> {
  const { DB } = bindings();
  if (!DB) return [];
  const res = await DB.prepare(
    "SELECT ts, soil_moisture, temperature, humidity, light FROM readings WHERE device_id = ? ORDER BY ts DESC LIMIT ?",
  )
    .bind(deviceId, limit)
    .all<Reading>();
  return res.results.reverse();
}

export async function recentAlerts(limit = 20) {
  const { DB } = bindings();
  if (!DB) return [];
  const res = await DB.prepare(
    "SELECT a.*, d.name AS device_name FROM alerts a JOIN devices d ON d.id = a.device_id ORDER BY a.ts DESC LIMIT ?",
  )
    .bind(limit)
    .all<{ id: number; device_id: string; device_name: string; ts: number; severity: string; metric: string; message: string }>();
  return res.results;
}

export async function getDevice(id: string): Promise<Device | null> {
  const { DB } = bindings();
  if (!DB) return null;
  return DB.prepare("SELECT * FROM devices WHERE id = ?").bind(id).first<Device>();
}

export function makeApiKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return "gs_live_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createDevice(name: string, crop: string, location: string): Promise<Device> {
  const { DB } = bindings();
  const id = "dev-" + makeApiKey().slice(8, 20);
  const device: Device = {
    id,
    name,
    crop: crop.toLowerCase(),
    location,
    api_key: makeApiKey(),
    is_demo: 0,
    incident: null,
  };
  await DB!.prepare(
    "INSERT INTO devices (id, name, crop, location, api_key, is_demo, incident, created_at) VALUES (?, ?, ?, ?, ?, 0, NULL, ?)",
  )
    .bind(device.id, device.name, device.crop, device.location, device.api_key, Date.now())
    .run();
  return device;
}

export async function ingestReading(apiKey: string, reading: Reading): Promise<{ ok: boolean; error?: string; insight?: Insight }> {
  const { DB } = bindings();
  if (!DB) return { ok: false, error: "database unavailable" };
  const device = await DB.prepare("SELECT * FROM devices WHERE api_key = ?").bind(apiKey).first<Device>();
  if (!device) return { ok: false, error: "unknown api key" };
  const r: Reading = {
    ts: reading.ts || Date.now(),
    soil_moisture: reading.soil_moisture,
    temperature: reading.temperature,
    humidity: reading.humidity,
    light: reading.light,
  };
  await DB.prepare(
    "INSERT INTO readings (device_id, ts, soil_moisture, temperature, humidity, light) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(device.id, r.ts, r.soil_moisture, r.temperature, r.humidity, r.light)
    .run();
  const history = await recentReadings(device.id, 13);
  const insight = analyze(device, history);
  const worst = Object.entries(insight.metrics).find(([, m]) => m.status === "critical");
  if (worst) {
    await DB.prepare("INSERT INTO alerts (device_id, ts, severity, metric, message) VALUES (?, ?, 'critical', ?, ?)")
      .bind(device.id, r.ts, worst[0], worst[1].message ?? "Critical reading")
      .run();
  }
  return { ok: true, insight };
}
