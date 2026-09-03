import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getDashboard, type DashboardData } from "../lib/api/growsense.functions";
import { Wordmark, IconDrop, IconThermo, IconHumidity, IconSun, IconChip, IconBrain, IconBell, Sparkline } from "../components/growsense/brand";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="paper-bg min-h-screen" style={{ color: "var(--color-ink)" }}>
      <Header />
      <Hero />
      <HowItListens />
      <LiveDemoBand />
      <ForBuilders />
      <TrackFit />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <Link to="/"><Wordmark /></Link>
      <nav className="flex items-center gap-6 text-sm font-medium" style={{ color: "var(--color-ink-soft)" }}>
        <a href="#how" className="hover:underline underline-offset-4">How it works</a>
        <a href="#builders" className="hover:underline underline-offset-4">For builders</a>
        <Link to="/dashboard" className="cta-hero !py-2 !px-4 !text-sm">Open the dashboard</Link>
      </nav>
    </header>
  );
}

function Hero() {
  // The hero card is the REAL demo device (Basil Shelf B2), polled live.
  const { data } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
    refetchInterval: 12000,
  });
  const d = data?.devices.find((x) => x.device.id === "demo-bas-b2") ?? data?.devices[0];
  const latest = d?.latest ?? null;
  const soil = d?.readings.slice(-24).map((r) => r.soil_moisture) ?? [62, 61, 60, 58, 57, 55, 53, 52, 49, 47, 45, 43];
  const statusColor = !d || d.status === "ok" ? "var(--color-leaf)" : d.status === "watch" ? "var(--color-gold)" : "var(--color-clay)";
  const statusLabel = !d ? "Reading sensors" : d.status === "ok" ? "Thriving" : d.status === "watch" ? "Watch" : "Needs water";
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-14 pb-20 md:grid-cols-2 md:items-center">
      <div>
        <p className="eyebrow mb-4">Field notes, written by sensors</p>
        <h1
          className="text-4xl leading-tight md:text-5xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500, letterSpacing: "-0.02em" }}
        >
          Your plants can't speak.
          <br />
          <span style={{ color: "var(--color-leaf)" }}>Your sensors can.</span>
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
          GrowSense listens to soil moisture, temperature, humidity and light, then turns the raw
          numbers into plain-language advice: what is wrong, how urgent it is, and exactly what to
          do next. Built for small farms, greenhouses and windowsill gardens.
        </p>
        <div className="mt-8 flex items-center gap-5">
          <Link to="/dashboard" className="cta-hero">
            Open the live dashboard
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <span className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
            No signup. Three demo devices already growing.
          </span>
        </div>
      </div>

      {/* live metric ledger card */}
      <div className="card-almanac p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold" style={{ letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-ink-soft)" }}>
            {d ? d.device.name : "Basil Shelf B2"}
          </p>
          <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: statusColor }}>
            <span className={`dot ${d ? `dot-${d.status}` : "dot-watch"} live-pulse`} /> {statusLabel}
          </span>
        </div>
        <div className="rule-dotted my-4" />
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { icon: <IconDrop />, v: latest ? `${latest.soil_moisture.toFixed(0)}%` : "...", l: "Soil" },
            { icon: <IconThermo />, v: latest ? `${latest.temperature.toFixed(0)}°C` : "...", l: "Temp" },
            { icon: <IconHumidity />, v: latest ? `${latest.humidity.toFixed(0)}%` : "...", l: "Humid" },
            { icon: <IconSun />, v: latest ? `${latest.light.toFixed(0)}` : "...", l: "Lux" },
          ].map((m) => (
            <div key={m.l} className="rounded-lg px-1 py-3" style={{ background: "var(--color-sage-soft)" }}>
              <div className="flex justify-center" style={{ color: "var(--color-leaf)" }}>{m.icon}</div>
              <p className="live-value mt-1 text-sm font-bold">{m.v}</p>
              <p className="text-xs" style={{ color: "var(--color-ink-soft)" }}>{m.l}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Sparkline
            values={soil}
            width={380}
            height={56}
            strokeColor={d && d.status === "critical" ? "var(--color-clay)" : "var(--color-leaf)"}
            fill={d && d.status === "critical" ? "rgba(192,86,59,0.10)" : "rgba(46,107,62,0.10)"}
          />
        </div>
        <div className="rule-dotted my-4" />
        <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-display)" }}>
          "{d ? d.insight.details[0] ?? d.headline : "Opening the greenhouse door..."}"
        </p>
        <p className="mt-2 text-xs" style={{ color: "var(--color-ink-soft)" }}>GrowSense insight, generated from live sensor data</p>
      </div>
    </section>
  );
}

function HowItListens() {
  const steps = [
    {
      icon: <IconChip size={22} />,
      title: "1. Listen",
      body: "Any ESP32-class microcontroller posts a reading over HTTP: soil moisture, temperature, humidity, light. One POST per interval, that is the whole contract.",
    },
    {
      icon: <IconBrain size={22} />,
      title: "2. Understand",
      body: "The agronomy engine compares every reading against crop-specific healthy bands and rolling trends, then writes a diagnosis in plain language with a severity level.",
    },
    {
      icon: <IconBell size={22} />,
      title: "3. Act",
      body: "Watch and critical findings surface as an alert ledger on your dashboard, so you fix the one bed that needs it instead of watering everything on a timer.",
    },
  ];
  return (
    <section id="how" className="border-y" style={{ borderColor: "var(--color-hairline)", background: "var(--color-sage-soft)" }}>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="eyebrow mb-3">How it works</p>
        <h2 className="text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
          Sensor to sentence in three steps
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="card-almanac p-6">
              <div className="mb-4 inline-flex rounded-lg p-2.5" style={{ background: "var(--color-sage)", color: "var(--color-leaf-deep)" }}>
                {s.icon}
              </div>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveDemoBand() {
  const { data } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
    refetchInterval: 30000,
  });
  const alerts = data?.alerts.slice(0, 3) ?? [];
  const rows =
    alerts.length > 0
      ? alerts.map((a) => ({
          sev: a.severity,
          dev: a.device_name,
          msg: a.message,
          when: timeAgo(a.ts),
        }))
      : [
          { sev: "watch", dev: "Basil Shelf B2", msg: "Soil moisture drifting below the healthy band; the engine is watching it.", when: "live" },
          { sev: "ok", dev: "Tomato Bed A1", msg: "All metrics inside healthy ranges.", when: "live" },
          { sev: "watch", dev: "Monstera Corner", msg: "Humidity creeping high; ventilation advised.", when: "live" },
        ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="eyebrow mb-3">Live demo</p>
          <h2 className="text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
            A working greenhouse, not a mockup
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            The dashboard you are about to open runs on a real database with three simulated
            devices streaming readings every few seconds. One of them, Basil Shelf B2, is quietly
            drying out; watch the engine catch it. The same pipeline accepts your own hardware the
            moment you paste an API key.
          </p>
          <ul className="mt-6 space-y-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            <li>&bull; 48 hours of history per device, drawn as live charts</li>
            <li>&bull; Crop-specific healthy bands for tomato, basil, pepper and more</li>
            <li>&bull; Alert ledger that records every critical finding</li>
          </ul>
          <div className="mt-8">
            <Link to="/dashboard" className="cta-hero">
              Watch it think
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
        <div className="card-almanac p-6">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-ink-soft)" }}>Alert ledger</p>
          <div className="rule-dotted my-3" />
          {rows.map((a) => (
            <div key={a.dev + a.when} className="flex gap-3 border-b py-3 last:border-0" style={{ borderColor: "var(--color-hairline)" }}>
              <span className={`dot dot-${a.sev} mt-1.5 shrink-0`} />
              <div>
                <p className="text-sm font-semibold">
                  {a.dev} <span className="font-normal" style={{ color: "var(--color-ink-soft)" }}>&middot; {a.when}</span>
                </p>
                <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>{a.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForBuilders() {
  const [copied, setCopied] = useState(false);
  const sample = `curl -X POST https://growsense-ai.alikarki2580.workers.dev/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "gs_live_your_key",
    "soil_moisture": 54.2,
    "temperature": 23.1,
    "humidity": 61.0,
    "light": 480
  }'`;
  return (
    <section id="builders" className="border-t" style={{ borderColor: "var(--color-hairline)" }}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <div className="card-almanac overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2" style={{ background: "var(--color-ink)" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--color-sage)", fontFamily: "var(--font-mono)" }}>POST /api/ingest</span>
              <button
                type="button"
                className="cta-copy"
                onClick={() => {
                  navigator.clipboard?.writeText(sample).then(
                    () => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1600);
                    },
                    () => {},
                  );
                }}
              >
                {copied ? "copied ✓" : "copy"}
              </button>
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed" style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}>
              {sample}
            </pre>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <p className="eyebrow mb-3">For builders</p>
          <h2 className="text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
            Bring your own hardware
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            Add a device in the dashboard, get an API key, and point any microcontroller with a
            Wi-Fi chip at the ingest endpoint. An ESP32 with a capacitive moisture sensor costs
            about $6; if you have no hardware yet, the simulator shows you exactly what your data
            will look like. Every accepted reading returns the generated insight, so your device
            can even drive an on-site display.
          </p>
        </div>
      </div>
    </section>
  );
}

function timeAgo(ts: number): string {
  const mins = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

function TrackFit() {
  const rows = [
    { track: "AI + Hardware Integration", fit: "An open ingest API for real sensors feeding an analysis engine that writes human-readable diagnoses." },
    { track: "Sustainability & Smart Cities", fit: "Water and crop savings for smallholders: treat the one bed that needs it, not the whole farm on a timer." },
    { track: "Smart Health Technology", fit: "The same band-and-trend engine generalizes to air quality and cold-chain monitoring." },
    { track: "Open Innovation", fit: "Every dashboard is also a public API: readings in, structured insights out." },
  ];
  return (
    <section className="border-t" style={{ borderColor: "var(--color-hairline)", background: "var(--color-sage-soft)" }}>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="eyebrow mb-3">Where it fits</p>
        <h2 className="text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
          Built for the real world
        </h2>
        <div className="mt-8 grid gap-x-12 gap-y-6 md:grid-cols-2">
          {rows.map((r) => (
            <div key={r.track} className="flex gap-4">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--color-leaf)" }} />
              <div>
                <h3 className="font-bold">{r.track}</h3>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>{r.fit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--color-hairline)" }}>
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 md:flex-row md:items-center">
      <Link to="/"><Wordmark /></Link>
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Built for VoltHacks 2026. Sensors simulated in software; real hardware welcome over the same API.
        </p>
        <Link to="/dashboard" className="cta-ledger">
          Open the dashboard <span className="arrow" aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </footer>
  );
}
