# 🌱 GrowSense

> **Field notes, written by sensors.**
> AI-powered environmental telemetry and agronomic intelligence for precision growing.

---

## 📖 Overview

**GrowSense** is an open-source agronomic monitoring platform that translates raw environmental telemetry—soil moisture, ambient temperature, relative humidity, and luminous flux—into real-time, actionable insights.

Designed for scalable deployment across commercial greenhouses, hydroponic facilities, micro-farms, and localized indoor setups, GrowSense continuously evaluates growing conditions against crop baselines, detects environmental anomalies, and delivers plain-language agronomic guidance.

---

## ✨ Key Features

* **Live Telemetry Dashboard:** Real-time metrics visualization featuring sparklines, multi-variable historical graphs, and system state indicators (*Thriving*, *Watch*, *Urgent Action*).
* **AI Agronomic Engine:** Automated anomaly detection and diagnostic intelligence tailored to specific plant species (e.g., *Solanaceae*, leafy greens, tropical foliage).
* **Hardware-Agnostic Ingest API:** Standardized REST endpoints supporting direct telemetry streams from IoT hardware (ESP32, Raspberry Pi, Arduino).
* **Integrated Hardware Simulator:** Built-in simulation suite capable of generating stress cycles (drought, thermal spikes, sensor drift) for rapid end-to-end testing.
* **Edge-Native Architecture:** Built on modern web technologies for low-latency telemetry ingestion and global edge distribution.

---

## 🛠️ Tech Stack

| Domain | Technology |
| --- | --- |
| **Framework** | [TanStack Start](https://tanstack.com/start) / [React 19](https://react.dev/) |
| **Routing & State** | [TanStack Router](https://tanstack.com/router), [TanStack Query](https://tanstack.com/query) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), Radix UI Primitives |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **Database & Runtime** | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite), Cloudflare Workers |
| **Package Manager & Tooling** | [Bun](https://bun.sh/) (v1.2+), Vite |

---

## 🚀 Getting Started

### Prerequisites

* **Bun** v1.2+ (recommended) or **Node.js** v20+

### Installation & Local Setup

1. **Clone the repository:**
```bash
git clone https://github.com/wraithen0/growsense.git
cd growsense/app
```

2. **Install dependencies:**
```bash
bun install
```

3. **Apply local database migrations (Cloudflare D1):**
```bash
bunx wrangler d1 migrations apply growsense-local-db --local
```

4. **Build the application:**
```bash
bun run build
```

5. **Start the local Cloudflare Worker runtime:**
```bash
bunx wrangler dev --port 8787
```

6. Open `http://localhost:8787` in your browser.

---

## 🔌 Hardware Ingest API

Push real-time telemetry from edge devices to GrowSense via the REST ingestion route.

### Endpoint Specification

* **Method:** `POST`
* **Path:** `/api/ingest`
* **Authentication:** Custom HTTP Header

### Headers

```http
Content-Type: application/json
X-Device-Key: YOUR_DEVICE_API_KEY

```

### Request Payload Format

```json
{
  "device_id": "greenhouse-sensor-01",
  "soil_moisture": 62.5,
  "temperature": 23.4,
  "humidity": 65.0,
  "light": 480
}

```

---

## 📂 Project Structure

```text
growsense/
├── app/
│   ├── migrations/       # Cloudflare D1 / SQLite database schemas
│   ├── packages/         # Shared internal packages and UI libraries
│   ├── public/           # Static assets and media resources
│   ├── src/
│   │   ├── components/   # UI primitives and dashboard modules
│   │   ├── lib/          # Agronomy inference engine, API clients, & server logic
│   │   ├── routes/       # File-based routing and server API endpoints
│   │   └── styles.css    # Design tokens and global CSS
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
└── README.md

```

---

