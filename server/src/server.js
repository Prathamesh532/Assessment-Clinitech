import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db.js";

const server = createApp().listen(env.PORT, () => console.log(`CareView API listening on port ${env.PORT}`));

function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  server.close(async () => { await pool.end(); process.exit(0); });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
