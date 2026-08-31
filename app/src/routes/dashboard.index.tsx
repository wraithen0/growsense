import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getDashboard, addDevice, type DashboardData } from "../lib/api/growsense.functions";
import { Wordmark, DataChart, Gauge, IconBell, formatSpan } from "../components/growsense/brand";

export const Route = createFileRoute("/dashboard/")({
  component: Almanac,
});

const BANDS: Record<string, { soil: [number, number]; temp: [number, number]; hum: [number, number]; lux: [number, number] }> = {
  tomato: { soil: [45, 70], temp: [18, 27], hum: [50, 70], lux: [350, 800] },
  basil: { soil: [50, 75], temp: [18, 26], hum: [55, 75], lux: [300, 700] },
  lettuce: { soil: [50, 72], temp: [14, 21], hum: [55, 75], lux: [200, 500] },
  pepper: { soil: [40, 65], temp: [20, 29], hum: [50, 70], lux: [350, 800] },
  monstera: { soil: [45, 65], temp: [18, 27], hum: [60, 80], lux: [150, 450] },
};
const DEFAULT_BANDS = BANDS.monstera;

function Almanac() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
    refetchInterval: 12000,
  });
  return (
    <main className="mx-auto max-w-6xl px-6 pb-20">
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>The Almanac</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Every device, read like a field notebook. Headlines are generated from live sensor data.
        </p>
        {isLoading || !data ? (
          <p className="mt-16 text-center text-sm" style={{ color: "var(--color-ink-soft)" }}>Opening the greenhouse door&hellip;</p>
        ) : (
          <>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {data.devices.map((d) => (
                <DeviceCard
                  key={d.device.id}
                  id={d.device.id}
                  name={d.device.name}
                  crop={d.device.crop}
                  location={d.device.location}
                  status={d.status}
                  headline={d.headline}
                  details={d.insight.details}
                  latest={d.latest}
                  soil={d.readings.map((r) => r.soil_moisture)}
                  readings={d.readings}
                  bands={BANDS[d.device.crop] ?? DEFAULT_BANDS}
                />
              ))}
              <AddDeviceCard />
            </div>
            <AlertsPanel alerts={data.alerts} />
          </>
        )}
    </main>
  );
}

function DeviceCard(props: {
  id: string;
  name: string;
  crop: string;
  location: string;
  status: "ok" | "watch" | "critical";
  headline: string;
  details: string[];
  latest: { soil_moisture: number; temperature: number; humidity: number; light: number } | null;
  soil: number[];
  readings: { ts: number; soil_moisture: number }[];
  bands: { soil: [number, number]; temp: [number, number]; hum: [number, number]; lux: [number, number] };
}) {
  const { name, crop, location, status, headline, details, latest, soil, readings, bands, id } = props;
  const statusLabel = status === "ok" ? "Thriving" : status === "watch" ? "Watch" : "Needs attention";
  return (
    <div className="card-almanac p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-bold">{name}</p>
          <p className="text-xs" style={{ color: "var(--color-ink-soft)" }}>{crop} &middot; {location}</p>
        </div>
        <span className="flex shrink-0 items-center gap-2 text-xs font-bold" style={{ color: status === "ok" ? "var(--color-leaf)" : status === "watch" ? "var(--color-gold)" : "var(--color-clay)" }}>
          <span className={`dot dot-${status}`} /> {statusLabel}
        </span>
      </div>
      {latest && (
        <div className="mt-4 flex justify-between">
          <Gauge value={latest.soil_moisture} min={0} max={95} lo={bands.soil[0]} hi={bands.soil[1]} label="Soil %" unit="%" status={statusOf(latest.soil_moisture, bands.soil)} />
          <Gauge value={latest.temperature} min={0} max={45} lo={bands.temp[0]} hi={bands.temp[1]} label="Temp °C" unit="°" status={statusOf(latest.temperature, bands.temp)} />
          <Gauge value={latest.humidity} min={0} max={95} lo={bands.hum[0]} hi={bands.hum[1]} label="Humid %" unit="%" status={statusOf(latest.humidity, bands.hum)} />
          <Gauge value={latest.light} min={0} max={1200} lo={bands.lux[0]} hi={bands.lux[1]} label="Lux" unit="" status={statusOf(latest.light, bands.lux)} />
        </div>
      )}
      <div className="mt-3">
        <DataChart
          points={readings.map((r) => ({ ts: r.ts, v: r.soil_moisture }))}
          band={bands.soil}
          unit="%"
          height={90}
          compact
        />
        <p className="mt-1 text-xs" style={{ color: "var(--color-ink-soft)" }}>Soil moisture, {formatSpan(readings)} &middot; hover for values</p>
      </div>
      <div className="rule-dotted my-4" />
      <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>{headline}</p>
      <ul className="mt-2 space-y-1">
        {details.slice(0, 2).map((d, i) => (
          <li key={i} className="text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>&ndash; {d}</li>
        ))}
      </ul>
      <div className="mt-4">
        <Link to="/dashboard/$id" params={{ id }} className="cta-ledger text-sm">
          Open device notebook <span className="arrow" aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}

function statusOf(v: number, [lo, hi]: [number, number]): "ok" | "watch" | "critical" {
  if (v < lo - (lo * 0.12 + 2) || v > hi + (hi * 0.12 + 2)) return "critical";
  if (v < lo || v > hi) return "watch";
  return "ok";
}

function AddDeviceCard() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [crop, setCrop] = useState("tomato");
  const [location, setLocation] = useState("");
  const [created, setCreated] = useState<{ api_key: string; id: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (created) {
    return (
      <div className="card-almanac p-6">
        <p className="font-bold">Device registered</p>
        <p className="mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Put this API key on your microcontroller. Its first reading will appear in the almanac automatically.
        </p>
        <div className="mt-4 rounded-lg p-3 text-xs break-all" style={{ background: "var(--color-ink)", color: "var(--color-sage)", fontFamily: "var(--font-mono)" }}>
          {created.api_key}
        </div>
        <button type="button" className="mt-4 text-sm" style={{ color: "var(--color-leaf)", fontWeight: 600 }} onClick={() => { setCreated(null); setName(""); setLocation(""); }}>
          Add another device
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" className="cta-add self-start" style={{ minHeight: 200 }} onClick={() => setOpen(true)}>
        + Add a device
      </button>
    );
  }

  return (
    <div className="card-almanac p-6">
      <p className="font-bold">Register a device</p>
      <div className="mt-4 space-y-3">
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-leaf)]"
          style={{ borderColor: "var(--color-hairline)", background: "var(--color-paper)" }}
          placeholder="Device name (e.g. Pepper Rack D4)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-leaf)]"
          style={{ borderColor: "var(--color-hairline)", background: "var(--color-paper)" }}
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        >
          {Object.keys(BANDS).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-leaf)]"
          style={{ borderColor: "var(--color-hairline)", background: "var(--color-paper)" }}
          placeholder="Location (e.g. Greenhouse, row 3)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        {error && <p className="text-sm" style={{ color: "var(--color-clay)" }}>{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            className="cta-hero !py-2 !px-4 !text-sm disabled:opacity-50"
            disabled={busy || !name.trim() || !location.trim()}
            onClick={() => {
              setBusy(true);
              setError(null);
              addDevice({ data: { name: name.trim(), crop, location: location.trim() } })
                .then((d) => setCreated({ api_key: d.api_key, id: d.id }))
                .catch(() => setError("Could not register the device. Try again."))
                .finally(() => setBusy(false));
            }}
          >
            {busy ? "Registering…" : "Create device"}
          </button>
          <button type="button" className="cta-ledger text-sm" onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AlertsPanel(props: { alerts: { id: number; device_name: string; ts: number; severity: string; metric: string; message: string }[] }) {
  return (
    <div className="card-almanac mt-8 p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-ink-soft)" }}>Alert ledger</p>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-ink-soft)" }}>
          <IconBell size={14} /> recorded findings
        </span>
      </div>
      <div className="rule-dotted my-3" />
      {props.alerts.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>No critical findings recorded yet. The engine only writes lines here when a reading crosses into the danger zone.</p>
      ) : (
        props.alerts.map((a) => (
          <div key={a.id} className="flex gap-3 border-b py-3 last:border-0" style={{ borderColor: "var(--color-hairline)" }}>
            <span className={`dot dot-${a.severity} mt-1.5 shrink-0`} />
            <div>
              <p className="text-sm font-semibold">
                {a.device_name} &middot; {a.metric.replace("_", " ")}
                <span className="ml-2 font-normal" style={{ color: "var(--color-ink-soft)" }}>{new Date(a.ts).toLocaleString()}</span>
              </p>
              <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>{a.message}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
