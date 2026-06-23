import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import XLSX from "xlsx";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const defaultWorkbook = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../healthcare dataset (2).xlsx");
const workbookArgument = process.argv.slice(2).find((argument) => argument !== "--");
const workbookPath = workbookArgument ? path.resolve(workbookArgument) : defaultWorkbook;

function excelDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(Date.UTC(1899, 11, 30 + value));
  return new Date(value);
}

async function batchInsert(rows, columns, table, conflictColumn, size = 500) {
  for (let offset = 0; offset < rows.length; offset += size) {
    const batch = rows.slice(offset, offset + size);
    const values = batch.flat();
    const placeholders = batch.map((_, rowIndex) => `(${columns.map((__, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`).join(",")})`).join(",");
    await pool.query(`INSERT INTO ${table} (${columns.join(",")}) VALUES ${placeholders} ON CONFLICT (${conflictColumn}) DO NOTHING`, values);
    console.log(`Processed ${Math.min(offset + size, rows.length)} of ${rows.length}`);
  }
}

async function main() {
  console.log(`Reading ${workbookPath}`);
  const workbook = XLSX.readFile(workbookPath, { cellDates: true });
  if (!workbook.Sheets.clients || !workbook.Sheets.health_reports) throw new Error("Workbook must contain clients and health_reports sheets");
  const clients = XLSX.utils.sheet_to_json(workbook.Sheets.clients).map((row) => [
    Number(row.client_id), String(row.full_name), String(row.email).toLowerCase(), String(row.mobile), String(row.city), String(row.state), Number(row.age),
    String(row.gender), String(row.occupation), String(row.health_condition), String(row.beauty_goal), excelDate(row.created_at),
  ]);
  const reports = XLSX.utils.sheet_to_json(workbook.Sheets.health_reports).map((row) => [
    String(row.report_id), Number(row.client_id), excelDate(row.report_date), Number(row.hemoglobin), Number(row.vitamin_d), Number(row.cholesterol),
    Number(row.blood_sugar_fasting), Number(row.creatinine), String(row.urine_protein), Number(row.bmi), String(row.doctor_notes),
  ]);
  console.log(`Importing ${clients.length} clients`);
  await batchInsert(clients, ["client_id","full_name","email","mobile","city","state","age","gender","occupation","health_condition","beauty_goal","created_at"], "clients", "client_id");
  console.log(`Importing ${reports.length} reports`);
  await batchInsert(reports, ["report_id","client_id","report_date","hemoglobin","vitamin_d","cholesterol","blood_sugar_fasting","creatinine","urine_protein","bmi","doctor_notes"], "health_reports", "report_id", 750);
  console.log("Dataset import complete");
}

main().finally(() => pool.end()).catch((error) => { console.error(error); process.exit(1); });
