import { parse } from "csv-parse/sync";
import xlsx from "xlsx";
import { query, withTransaction } from "../db.js";
import { healthReportCsvRowSchema } from "../schemas/report.schema.js";

function recordsFromCsv(buffer) {
  return parse(buffer, { columns: true, bom: true, skip_empty_lines: true, trim: true });
}

function recordsFromWorkbook(buffer) {
  const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "", raw: false });
}

export async function importHealthReportFile(file) {
  const lowerName = file.originalname.toLowerCase();
  const records = lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")
    ? recordsFromWorkbook(file.buffer)
    : recordsFromCsv(file.buffer);
  const errors = [];
  const validRows = [];

  records.forEach((record, index) => {
    const result = healthReportCsvRowSchema.safeParse(record);
    if (!result.success) {
      errors.push({ row: index + 2, ...(record.report_id ? { reportId: record.report_id } : {}), message: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") });
    } else {
      validRows.push({ ...result.data, sourceRow: index + 2 });
    }
  });

  const clientIds = [...new Set(validRows.map((row) => row.client_id))];
  if (clientIds.length) {
    const existing = await query("SELECT client_id FROM clients WHERE client_id = ANY($1::int[])", [clientIds]);
    const known = new Set(existing.rows.map((row) => row.client_id));
    validRows.forEach((row) => {
      if (!known.has(row.client_id)) errors.push({ row: row.sourceRow, reportId: row.report_id, message: `Client ${row.client_id} does not exist` });
    });
  }

  if (errors.length) return { totalRows: records.length, imported: 0, skippedDuplicates: 0, errors };

  const imported = await withTransaction(async (client) => {
    let count = 0;
    for (const row of validRows) {
      const result = await client.query(
        `INSERT INTO health_reports (report_id, client_id, report_date, hemoglobin, vitamin_d, cholesterol, blood_sugar_fasting, creatinine, urine_protein, bmi, doctor_notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (report_id) DO NOTHING`,
        [row.report_id, row.client_id, row.report_date, row.hemoglobin, row.vitamin_d, row.cholesterol, row.blood_sugar_fasting, row.creatinine, row.urine_protein, row.bmi, row.doctor_notes],
      );
      count += result.rowCount;
    }
    return count;
  });

  return { totalRows: records.length, imported, skippedDuplicates: validRows.length - imported, errors: [] };
}
