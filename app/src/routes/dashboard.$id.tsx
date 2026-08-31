import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { getDashboard, type DashboardData } from "../lib/api/growsense.functions";
import { IconDrop, IconThermo, IconHumidity, IconSun, DataChart, formatSpan } from "../components/growsense/brand";

export const Route = createFileRoute("/dashboard/$id")({
  component: DeviceNotebook,
  head: () => ({ meta: [{ title: "GrowSense Device" }] }),
});

const BANDS: Record<string, { soil: [number, number]; temp: [number, number]; hum: [number, number]; lux: [number, number]; labels: string }> = {
  tomato: { soil: [45, 70], temp: [18, 27], hum: [50, 70], lux: [350, 800], labels: "soil 45-70% · temp 18-27°C · humidity 50-70% · light 350-800 lx" },
  basil: { soil: [50, 75], temp: [18, 26], hum: [55, 75], lux: [300, 700], labels: "soil 50-75% · temp 18-26°C · humidity 55-75% · light 300-700 lx" },
  lettuce: { soil: [50, 72], temp: [14, 21], hum: [55, 75], lux: [200, 500], labels: "soil 50-72% · temp 14-21°C · humidity 55-75% · light 200-500 lx" },
  pepper: { soil: [40, 65], temp: [20, 29], hum: [50, 70], lux: [350, 800], labels: "soil 40-65% · temp 20-29°C · humidity 50-70% · light 350-800 lx" },
  monstera: { soil: [45, 65], temp: [18, 27], hum: [60, 80], lux: [150, 450], labels: "soil 45-65% · temp 18-27°C · humidity 60-80% · light 150-450 lx" },
};
const DEFAULT_BANDS = BANDS.monstera;

function DeviceNotebook() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
    refetchInterval: 12000,
  });
  const entry = data?.devices.find((x) => x.device.id === id) ?? null;

  return (
    <main className="mx-auto max-w-4xl px-6 pb-20">
      <div className="mb-4 flex justify-end">
        <Link to="/dashboard" className="cta-ledger text-sm">
          <span aria-hidden="true">&larr;</span> Back to the almanac
        </Link>
      </div>
        {isLoading ? (
          <p className="mt-16 text-center text-sm" style={{ color: "var(--color-ink-soft)" }}>Fetching the notebook&hellip;</p>
        ) : !entry ? (
          <p className="mt-16 text-center text-sm" style={{ color: "var(--color-ink-soft)" }}>
            This device does not exist. <Link to="/dashboard" className="cta-ledger">Back to the almanac <span className="arrow" aria-hidden="true">&rarr;</span></Link>
          </p>
        ) : (
          <DeviceNotebookBody
            name={entry.device.name}
            crop={entry.device.crop}
            location={entry.device.location}
            headline={entry.insight.headline}
            details={entry.insight.details}
            status={entry.insight.status}
            readings={entry.readings}
            bands={BANDS[entry.device.crop] ?? DEFAULT_BANDS}
          />
        )}
    </main>
  );
}

type R = { ts: number; soil_moisture: number; temperature: number; humidity: number; light: number };

function DeviceNotebookBody(props: {
  name: string;
  crop: string;
  location: string;
  headline: string;
  details: string[];
  status: "ok" | "watch" | "critical";
  readings: R[];
  bands: { soil: [number, number]; temp: [number, number]; hum: [number, number]; lux: [number, number]; labels: string };
}) {
  const { name, crop, location, headline, details, status, readings, bands } = props;
  const latest = readings[readings.length - 1];
  const charts = [
    { key: "soil_moisture", unit: "%", label: "Soil moisture %", icon: <IconDrop />, band: bands.soil, color: "var(--color-leaf)", fill: "rgba(46,107,62,0.10)" },
    { key: "temperature", unit: "°C", label: "Temperature °C", icon: <IconThermo />, band: bands.temp, color: "var(--color-gold)", fill: "rgba(185,138,47,0.10)" },
    { key: "humidity", unit: "%", label: "Humidity %", icon: <IconHumidity />, band: bands.hum, color: "#3E6B8C", fill: "rgba(62,107,140,0.10)" },
    { key: "light", unit: " lx", label: "Light lx", icon: <IconSun />, band: bands.lux, color: "var(--color-clay)", fill: "rgba(192,86,59,0.10)" },
  ] as const;
  return (
    <>
      <p className="eyebrow">Device notebook</p>
      <h1 className="mt-2 text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>{name}</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        {crop} &middot; {location} &middot; healthy band: {bands.labels}
      </p>

      <div className="card-almanac mt-6 p-6">
        <span className="flex items-center gap-2 text-xs font-bold" style={{ color: status === "ok" ? "var(--color-leaf)" : status === "watch" ? "var(--color-gold)" : "var(--color-clay)" }}>
          <span className={`dot dot-${status}`} /> {status === "ok" ? "Thriving" : status === "watch" ? "Watch" : "Needs attention"}
        </span>
        <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-display)" }}>{headline}</p>
        <ul className="mt-3 space-y-2">
          {details.map((d, i) => (
            <li key={i} className="text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>&ndash; {d}</li>
          ))}
        </ul>
        {latest && (
          <p className="mt-3 text-xs" style={{ color: "var(--color-ink-soft)" }}>
            Last reading {new Date(latest.ts).toLocaleString()} &middot; {readings.length} readings on record
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {charts.map((c) => {
          const values = readings.map((r) => r[c.key] as number);
          return (
            <div key={c.key} className="card-almanac p-5">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-ink)" }}>
                  <span style={{ color: c.color }}>{c.icon}</span> {c.label}
                </p>
                <p className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
                  band {c.band[0]}&ndash;{c.band[1]}
                </p>
              </div>
              <div className="mt-3">
                <DataChart
                  points={readings.map((r) => ({ ts: r.ts, v: r[c.key] as number }))}
                  band={c.band}
                  unit={c.unit}
                  color={c.color}
                  fill={c.fill}
                  height={160}
                />
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--color-ink-soft)" }}>{formatSpan(readings)} &middot; {readings.length} readings &middot; hover for exact values</p>
            </div>
          );
        })}
      </div>
    </>
  );
}
