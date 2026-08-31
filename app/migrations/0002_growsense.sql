-- GrowSense schema (additive)
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  crop TEXT NOT NULL DEFAULT 'Unknown crop',
  location TEXT NOT NULL DEFAULT 'Unspecified',
  api_key TEXT NOT NULL UNIQUE,
  is_demo INTEGER NOT NULL DEFAULT 0,
  incident TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL REFERENCES devices(id),
  ts INTEGER NOT NULL,
  soil_moisture REAL NOT NULL,
  temperature REAL NOT NULL,
  humidity REAL NOT NULL,
  light REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_readings_device_ts ON readings(device_id, ts);

CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL REFERENCES devices(id),
  ts INTEGER NOT NULL,
  severity TEXT NOT NULL,
  metric TEXT NOT NULL,
  message TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_alerts_device_ts ON alerts(device_id, ts);
