import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../db/migrations");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false });

async function main() {
  await pool.query("CREATE TABLE IF NOT EXISTS app_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)");
  const files = (await fs.readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    const exists = await pool.query("SELECT 1 FROM app_migrations WHERE name = $1", [file]);
    if (exists.rowCount) continue;
    const sql = await fs.readFile(path.join(directory, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO app_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`Applied migration ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  console.log("Database migrations are up to date");
}

main().finally(() => pool.end()).catch((error) => { console.error(error); process.exit(1); });
