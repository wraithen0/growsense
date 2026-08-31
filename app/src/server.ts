import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Device-facing ingest endpoint. Hardware (ESP32 etc.) POSTs a reading here;
// handled before the SSR app so it works as a plain JSON API.
async function handleIngest(request: Request): Promise<Response> {
  const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "Content-Type",
  };
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") {
    return Response.json({ ok: false, error: "POST a JSON reading" }, { status: 405, headers: cors });
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "invalid JSON body" }, { status: 400, headers: cors });
  }
  const num = (v: unknown) => typeof v === "number" && Number.isFinite(v) ? v : undefined;
  const apiKey = typeof body.api_key === "string" ? body.api_key : undefined;
  const soil = num(body.soil_moisture);
  const temp = num(body.temperature);
  const hum = num(body.humidity);
  const light = num(body.light);
  if (!apiKey || soil === undefined || temp === undefined || hum === undefined || light === undefined) {
    return Response.json(
      { ok: false, error: "required fields: api_key, soil_moisture, temperature, humidity, light (all numbers)" },
      { status: 422, headers: cors },
    );
  }
  // Physical bounds: reject impossible readings instead of storing them
  const inRange = (v: number, lo: number, hi: number) => v >= lo && v <= hi;
  if (!inRange(soil, 0, 100) || !inRange(hum, 0, 100) || !inRange(temp, -50, 80) || !inRange(light, 0, 200000)) {
    return Response.json(
      { ok: false, error: "out of range: soil/humidity 0-100, temperature -50..80 C, light 0-200000 lx" },
      { status: 422, headers: cors },
    );
  }
  const { ingestReading } = await import("./lib/growsense.server");
  const result = await ingestReading(apiKey, {
    // devices with wrong clocks must not plant readings in the future
    ts: Math.min(num(body.ts) ?? Date.now(), Date.now()),
    soil_moisture: soil,
    temperature: temp,
    humidity: hum,
    light: light,
  });
  if (!result.ok) return Response.json({ ok: false, error: result.error }, { status: 401, headers: cors });
  return Response.json({ ok: true, insight: result.insight }, { headers: cors });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/ingest") {
        return await handleIngest(request);
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
