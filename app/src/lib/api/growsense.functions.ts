import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  analyze,
  createDevice,
  ensureSeeded,
  getDevice,
  ingestReading,
  listDevices,
  recentAlerts,
  recentReadings,
  tickSimulator,
  type DeviceSummary,
  type Insight,
} from "../growsense.server";

export type DashboardData = {
  devices: (DeviceSummary & { insight: Insight; readings: Awaited<ReturnType<typeof recentReadings>> })[];
  alerts: Awaited<ReturnType<typeof recentAlerts>>;
};

export const getDashboard = createServerFn({ method: "GET" }).handler(async (): Promise<DashboardData> => {
  await ensureSeeded();
  await tickSimulator();
  const devices = await listDevices();
  const out: DashboardData["devices"] = [];
  for (const device of devices) {
    const readings = await recentReadings(device.id);
    const insight = analyze(device, readings);
    out.push({
      device,
      latest: readings[readings.length - 1] ?? null,
      status: insight.status,
      headline: insight.headline,
      insight,
      readings,
    });
  }
  const alerts = await recentAlerts();
  return { devices: out, alerts };
});

export const addDevice = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().min(1).max(80), crop: z.string().min(1).max(40), location: z.string().min(1).max(120) }))
  .handler(async ({ data }) => {
    return createDevice(data.name, data.crop, data.location);
  });

export const getDeviceDetail = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const device = await getDevice(data.id);
    if (!device) return null;
    const readings = await recentReadings(device.id);
    return { device, readings, insight: analyze(device, readings) };
  });

// Device-facing ingest endpoint is a server route (/api/ingest) for real
// hardware; this function backs it.
export const ingest = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      api_key: z.string(),
      ts: z.number().optional(),
      soil_moisture: z.number(),
      temperature: z.number(),
      humidity: z.number(),
      light: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const res = await ingestReading(data.api_key, {
      ts: data.ts ?? Date.now(),
      soil_moisture: data.soil_moisture,
      temperature: data.temperature,
      humidity: data.humidity,
      light: data.light,
    });
    if (!res.ok) throw new Error(res.error);
    return { ok: true, insight: res.insight };
  });
