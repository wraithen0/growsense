import { useState } from "react";

// GrowSense brand + data visuals, all hand-drawn inline SVG (no raster assets).

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label="GrowSense">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="24" height="24" rx="7" stroke="#1E2B22" strokeWidth="1.6" />
        <path d="M13 20V11" stroke="#1E2B22" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M13 13C13 9.5 10.5 7.5 6.5 7.5C6.5 11.5 9 13 13 13Z" fill="#2E6B3E" />
        <path d="M13 15.5C13 12.5 15.2 10.8 18.7 10.8C18.7 14.3 16.5 15.5 13 15.5Z" fill="#2E6B3E" opacity="0.55" />
      </svg>
      {!compact && (
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 600, letterSpacing: "-0.01em" }}>
          Grow<span style={{ color: "var(--color-leaf)" }}>Sense</span>
        </span>
      )}
    </span>
  );
}

// 1.5px ink-stroke icon set (brief: custom 8-icon set)
const stroke = { stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

export function IconDrop(props: { size?: number }) {
  const { size = 18 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2.5C10 2.5 4.5 9 4.5 12.5a5.5 5.5 0 0 0 11 0C15.5 9 10 2.5 10 2.5Z" {...stroke} />
    </svg>
  );
}
export function IconThermo(props: { size?: number }) {
  const { size = 18 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M8.5 11.8V4a1.5 1.5 0 0 1 3 0v7.8a3.5 3.5 0 1 1-3 0Z" {...stroke} />
      <path d="M10 8v5.2" {...stroke} />
    </svg>
  );
}
export function IconHumidity(props: { size?: number }) {
  const { size = 18 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 8c2.3 0 2.3 2 4.6 2S9.9 8 12.2 8s2.4 2 4.8 2" {...stroke} />
      <path d="M3 12.5c2.3 0 2.3 2 4.6 2s2.3-2 4.6-2 2.4 2 4.8 2" {...stroke} />
    </svg>
  );
}
export function IconSun(props: { size?: number }) {
  const { size = 18 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="3.2" {...stroke} />
      <path d="M10 2v2.2M10 15.8V18M2 10h2.2M15.8 10H18M4.3 4.3l1.5 1.5M14.2 14.2l1.5 1.5M15.7 4.3l-1.5 1.5M5.8 14.2l-1.5 1.5" {...stroke} />
    </svg>
  );
}
export function IconLeaf(props: { size?: number }) {
  const { size = 18 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M16 4C9 4 4.5 7.5 4.5 13.5c0 .9.1 1.7.4 2.5C11 16 16 11.5 16 4Z" {...stroke} />
      <path d="M5 16C8 12 11.5 9 15 6.5" {...stroke} />
    </svg>
  );
}
export function IconChip(props: { size?: number }) {
  const { size = 18 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <rect x="5.5" y="5.5" width="9" height="9" rx="1.5" {...stroke} />
      <path d="M8 2.5v3M12 2.5v3M8 14.5v3M12 14.5v3M2.5 8h3M2.5 12h3M14.5 8h3M14.5 12h3" {...stroke} />
    </svg>
  );
}
export function IconBrain(props: { size?: number }) {
  const { size = 18 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 4.5a3 3 0 0 0-5.8 1A2.8 2.8 0 0 0 3 8.2c0 1 .5 1.9 1.3 2.4A2.9 2.9 0 0 0 7 15.5c.7 0 1.3-.2 1.8-.6.4-.3.7-.7.9-1.1.2.4.5.8.9 1.1.5.4 1.1.6 1.8.6a2.9 2.9 0 0 0 2.7-4.9A3 3 0 0 0 15.8 5.5a3 3 0 0 0-5.8-1Z" {...stroke} />
      <path d="M10 4.5v9.3" {...stroke} />
    </svg>
  );
}
export function IconBell(props: { size?: number }) {
  const { size = 18 } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 3a4.5 4.5 0 0 0-4.5 4.5c0 4-1.5 5-1.5 5h12s-1.5-1-1.5-5A4.5 4.5 0 0 0 10 3Z" {...stroke} />
      <path d="M8.5 15.5a1.5 1.5 0 0 0 3 0" {...stroke} />
    </svg>
  );
}

const ICONS = { IconDrop, IconThermo, IconHumidity, IconSun, IconLeaf, IconChip, IconBrain, IconBell };

// Sparkline from a numeric series: pure SVG polyline with an area fill.
export function Sparkline({
  values,
  width = 220,
  height = 48,
  strokeColor = "var(--color-leaf)",
  fill = "rgba(46,107,62,0.10)",
}: {
  values: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fill?: string;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 4) + 2;
    const y = height - 4 - ((v - min) / span) * (height - 10);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="max-w-full">
      <polygon points={`2,${height - 2} ${pts.join(" ")} ${width - 2},${height - 2}`} fill={fill} />
      <polyline points={pts.join(" ")} fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r="2.6" fill={strokeColor} />
    </svg>
  );
}

// Radial gauge for a single metric against its healthy band.
export function Gauge({
  value,
  min,
  max,
  lo,
  hi,
  label,
  unit,
  status,
}: {
  value: number;
  min: number;
  max: number;
  lo: number;
  hi: number;
  label: string;
  unit: string;
  status: "ok" | "watch" | "critical";
}) {
  const clamped = Math.min(max, Math.max(min, value));
  const frac = (clamped - min) / (max - min);
  const R = 34;
  const C = Math.PI * R; // half circle
  const arc = (from: number, to: number) => {
    const a1 = Math.PI * (1 - from);
    const a2 = Math.PI * (1 - to);
    const x1 = 40 + R * Math.cos(a1);
    const y1 = 42 - R * Math.sin(a1);
    const x2 = 40 + R * Math.cos(a2);
    const y2 = 42 - R * Math.sin(a2);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };
  const color = status === "ok" ? "var(--color-leaf)" : status === "watch" ? "var(--color-gold)" : "var(--color-clay)";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="52" viewBox="0 0 80 52" aria-hidden="true">
        <path d={arc(0, 1)} stroke="var(--color-hairline)" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path
          d={arc(Math.max(0, (lo - min) / (max - min)), Math.min(1, (hi - min) / (max - min)))}
          stroke="var(--color-sage)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path d={arc(0, Math.max(0.01, frac))} stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <text x="40" y="40" textAnchor="middle" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "13px", fill: "var(--color-ink)" }}>
          {value.toFixed(0)}
          {unit.trim()}
        </text>
      </svg>
      <span className="text-xs font-medium" style={{ color: "var(--color-ink-soft)" }}>
        {label}
      </span>
    </div>
  );
}

// Honest chart caption: span computed from the actual first/last timestamps.
export function formatSpan(readings: { ts: number }[] | number[]): string {
  if (readings.length < 2) return "awaiting data";
  const tsOf = (p: { ts: number } | number) => (typeof p === "number" ? p : p.ts);
  const spanMin = Math.max(1, Math.round((tsOf(readings[readings.length - 1]) - tsOf(readings[0])) / 60000));
  if (spanMin < 90) return `last ${spanMin} minutes`;
  const hours = spanMin / 60;
  if (hours < 48) return `last ${hours.toFixed(hours % 1 === 0 ? 0 : 1)} hours`;
  return `last ${(hours / 24).toFixed(1)} days`;
}


// Full interactive chart: healthy-band shading, y-range labels, time axis,
// and a hover crosshair with exact value + time. Replaces the bare sparkline
// anywhere the data needs to be readable.
export function DataChart({
  points,
  band,
  unit,
  color = "var(--color-leaf)",
  fill = "rgba(46,107,62,0.10)",
  height = 150,
  compact = false,
}: {
  points: { ts: number; v: number }[];
  band?: [number, number];
  unit?: string;
  color?: string;
  fill?: string;
  height?: number;
  compact?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (points.length === 0) return null;

  const W = compact ? 420 : 520;
  const H = height;
  const PADL = 6;
  const PADR = 46;
  const PADT = 10;
  const PADB = compact ? 6 : 18;
  const lo = band ? Math.min(...points.map((p) => p.v), band[0]) : Math.min(...points.map((p) => p.v));
  const hi = band ? Math.max(...points.map((p) => p.v), band[1]) : Math.max(...points.map((p) => p.v));
  const span = hi - lo || 1;
  const margin = span * 0.08;
  const yMin = lo - margin;
  const yMax = hi + margin;
  const x = (i: number) => PADL + (i / Math.max(1, points.length - 1)) * (W - PADL - PADR);
  const y = (v: number) => PADT + (1 - (v - yMin) / (yMax - yMin)) * (H - PADT - PADB);

  const line = points.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const area = `${PADL},${H - PADB} ${line} ${x(points.length - 1).toFixed(1)},${H - PADB}`;
  const fmt = (v: number) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2));
  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fmtDayTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${fmtTime(ts)}`;
  };

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (points.length < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PADL) / (W - PADL - PADR)) * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  };

  const hp = hover !== null ? points[hover] : null;

  return (
    <div className="relative" style={{ touchAction: "pan-y" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`chart from ${fmt(points[0].v)} to ${fmt(points[points.length - 1].v)}${unit ?? ""}`}
      >
        {/* healthy band */}
        {band && (
          <>
            <rect
              x={PADL}
              y={y(band[1])}
              width={W - PADL - PADR}
              height={Math.max(1, y(band[0]) - y(band[1]))}
              fill="rgba(46,107,62,0.08)"
            />
            <line x1={PADL} x2={W - PADR} y1={y(band[0])} y2={y(band[0])} stroke="var(--color-leaf)" strokeWidth="0.7" strokeDasharray="4 4" opacity="0.5" />
            <line x1={PADL} x2={W - PADR} y1={y(band[1])} y2={y(band[1])} stroke="var(--color-leaf)" strokeWidth="0.7" strokeDasharray="4 4" opacity="0.5" />
          </>
        )}
        {/* area + line */}
        <polygon points={area} fill={fill} />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* hover crosshair */}
        {hp && (
          <>
            <line x1={x(hover!)} x2={x(hover!)} y1={PADT} y2={H - PADB} stroke="var(--color-ink-soft)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
            <circle cx={x(hover!)} cy={y(hp.v)} r="4" fill={color} stroke="var(--color-paper-raised)" strokeWidth="1.5" />
          </>
        )}
        {/* latest point */}
        {!hp && <circle cx={x(points.length - 1)} cy={y(points[points.length - 1].v)} r="3" fill={color} />}
        {/* y-range labels */}
        <text x={W - PADR + 6} y={PADT + 8} style={{ fontSize: "10px", fill: "var(--color-ink-soft)", fontFamily: "var(--font-body)" }}>
          {fmt(hi)}
        </text>
        <text x={W - PADR + 6} y={H - PADB} style={{ fontSize: "10px", fill: "var(--color-ink-soft)", fontFamily: "var(--font-body)" }}>
          {fmt(lo)}
        </text>
        {/* x-axis time labels */}
        {!compact && (
          <>
            <text x={PADL} y={H - 4} style={{ fontSize: "10px", fill: "var(--color-ink-soft)", fontFamily: "var(--font-body)" }}>
              {fmtDayTime(points[0].ts)}
            </text>
            <text x={W - PADR} y={H - 4} textAnchor="end" style={{ fontSize: "10px", fill: "var(--color-ink-soft)", fontFamily: "var(--font-body)" }}>
              {fmtDayTime(points[points.length - 1].ts)}
            </text>
          </>
        )}
      </svg>
      {/* tooltip */}
      {hp && (
        <div
          className="pointer-events-none absolute z-10 rounded-md px-2 py-1 text-xs font-semibold"
          style={{
            background: "var(--color-ink)",
            color: "var(--color-sage)",
            fontFamily: "var(--font-mono)",
            left: `min(max(0px, ${(x(hover!) / W) * 100}% - 60px), calc(100% - 130px))`,
            top: Math.max(0, y(hp.v) - 44) + "px",
            whiteSpace: "nowrap",
          }}
        >
          {fmt(hp.v)}
          {unit ?? ""} &middot; {fmtDayTime(hp.ts)}
        </div>
      )}
    </div>
  );
}

export { ICONS };
