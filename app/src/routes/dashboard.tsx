import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

import { Wordmark } from "../components/growsense/brand";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  head: () => ({ meta: [{ title: "GrowSense Dashboard" }] }),
});

function DashboardLayout() {
  return (
    <div className="paper-bg min-h-screen" style={{ color: "var(--color-ink)" }}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/"><Wordmark /></Link>
        <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--color-ink-soft)" }}>
          <span className="dot dot-ok live-pulse" /> live &middot; refreshing every 12s
        </span>
      </header>
      <Outlet />
    </div>
  );
}

function statusOf(v: number, [lo, hi]: [number, number]): "ok" | "watch" | "critical" {
  if (v < lo - (lo * 0.12 + 2) || v > hi + (hi * 0.12 + 2)) return "critical";
  if (v < lo || v > hi) return "watch";
  return "ok";
}
