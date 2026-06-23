import pg from "pg";
import { env } from "./config/env.js";

const { Pool, types } = pg;

// PostgreSQL returns NUMERIC values as strings to avoid precision loss. The app's
// clinical ranges fit safely in JavaScript numbers, so convert them at the driver boundary.
types.setTypeParser(1700, (value) => Number(value));

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.NODE_ENV === "test" ? 2 : 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (error) => console.error("Unexpected database pool error", error));

export const query = (text, values = []) => pool.query(text, values);

export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
