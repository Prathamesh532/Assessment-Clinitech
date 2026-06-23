import { Router } from "express";
import multer from "multer";
import { query } from "../db.js";
import { asyncHandler } from "../lib/async-handler.js";
import { HttpError } from "../lib/http-error.js";
import { paginationMeta } from "../lib/pagination.js";
import { presentClient } from "../lib/client-presenter.js";
import { presentReport } from "../lib/report-presenter.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { clientIdSchema, clientListSchema } from "../schemas/client.schema.js";
import { createReportSchema, reportListSchema } from "../schemas/report.schema.js";
import { writeAuditLog } from "../services/audit.service.js";
import { importHealthReportFile } from "../services/csv-import.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    const lowerName = file.originalname.toLowerCase();
    const validMime = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(file.mimetype);
    if (validMime || lowerName.endsWith(".csv") || lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) callback(null, true);
    else callback(new HttpError(400, "Only CSV or Excel files are accepted"));
  },
});

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/clients", validate("query", clientListSchema), asyncHandler(async (request, response) => {
  const input = request.validated.query;
  const values = [];
  const conditions = [];
  const add = (sql, value) => { values.push(value); conditions.push(sql.replace("?", `$${values.length}`)); };
  if (input.search) {
    values.push(`%${input.search}%`);
    conditions.push(`(c.full_name ILIKE $${values.length} OR c.email ILIKE $${values.length} OR c.mobile ILIKE $${values.length})`);
  }
  if (input.city) add("c.city ILIKE ?", `%${input.city}%`);
  if (input.state) add("c.state ILIKE ?", `%${input.state}%`);
  if (input.gender) add("c.gender ILIKE ?", input.gender);
  if (input.healthCondition) add("c.health_condition ILIKE ?", `%${input.healthCondition}%`);
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const countResult = await query(`SELECT COUNT(*)::int AS total FROM clients c ${where}`, values);
  values.push(input.pageSize, (input.page - 1) * input.pageSize);
  const result = await query(
    `SELECT c.*, COUNT(r.report_id)::int AS report_count FROM clients c
     LEFT JOIN health_reports r ON r.client_id = c.client_id ${where}
     GROUP BY c.client_id ORDER BY c.full_name ASC LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  response.json({ data: result.rows.map(presentClient), meta: paginationMeta(countResult.rows[0].total, input) });
}));

adminRouter.get("/clients/:clientId", validate("params", clientIdSchema), asyncHandler(async (request, response) => {
  const { clientId } = request.validated.params;
  const [clientResult, latestResult] = await Promise.all([
    query(`SELECT c.*, COUNT(r.report_id)::int AS report_count FROM clients c LEFT JOIN health_reports r ON r.client_id = c.client_id WHERE c.client_id = $1 GROUP BY c.client_id`, [clientId]),
    query("SELECT * FROM health_reports WHERE client_id = $1 ORDER BY report_date DESC LIMIT 1", [clientId]),
  ]);
  if (!clientResult.rows[0]) throw new HttpError(404, "Client was not found");
  response.json({ data: { ...presentClient(clientResult.rows[0]), latestReport: latestResult.rows[0] ? presentReport(latestResult.rows[0]) : null } });
}));

adminRouter.get("/clients/:clientId/reports", validate("params", clientIdSchema), validate("query", reportListSchema), asyncHandler(async (request, response) => {
  const { clientId } = request.validated.params;
  const input = request.validated.query;
  const [countResult, result] = await Promise.all([
    query("SELECT COUNT(*)::int AS total FROM health_reports WHERE client_id = $1", [clientId]),
    query("SELECT * FROM health_reports WHERE client_id = $1 ORDER BY report_date DESC LIMIT $2 OFFSET $3", [clientId, input.pageSize, (input.page - 1) * input.pageSize]),
  ]);
  response.json({ data: result.rows.map(presentReport), meta: paginationMeta(countResult.rows[0].total, input) });
}));

adminRouter.post("/clients/:clientId/reports", validate("params", clientIdSchema), validate("body", createReportSchema), asyncHandler(async (request, response) => {
  const { clientId } = request.validated.params;
  const input = request.validated.body;
  const clientResult = await query("SELECT client_id FROM clients WHERE client_id = $1", [clientId]);
  if (!clientResult.rows[0]) throw new HttpError(404, "Client was not found");

  const reportId = `MANUAL-${clientId}-${Date.now()}`;
  const result = await query(
    `INSERT INTO health_reports (report_id, client_id, report_date, hemoglobin, vitamin_d, cholesterol, blood_sugar_fasting, creatinine, urine_protein, bmi, doctor_notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [reportId, clientId, input.reportDate, input.hemoglobin, input.vitaminD, input.cholesterol, input.bloodSugarFasting, input.creatinine, input.urineProtein, input.bmi, input.doctorNotes],
  );
  await writeAuditLog({ request, action: "REPORT_CREATED", entityType: "HealthReport", entityId: reportId, metadata: { clientId } });
  response.status(201).json({ data: presentReport(result.rows[0]) });
}));

adminRouter.post("/reports/import", upload.single("file"), asyncHandler(async (request, response) => {
  if (!request.file) throw new HttpError(400, "Select a CSV or Excel file to import");
  const result = await importHealthReportFile(request.file);
  await writeAuditLog({ request, action: result.errors.length ? "REPORT_IMPORT_REJECTED" : "REPORT_IMPORT_COMPLETED", entityType: "HealthReport", metadata: { filename: request.file.originalname, totalRows: result.totalRows, imported: result.imported, errors: result.errors.length } });
  response.status(result.errors.length ? 422 : 201).json({ data: result });
}));

adminRouter.get("/audit-logs", asyncHandler(async (_request, response) => {
  const result = await query(
    `SELECT a.*, u.email AS actor_email FROM audit_logs a LEFT JOIN users u ON u.id = a.actor_id ORDER BY a.created_at DESC LIMIT 50`,
  );
  response.json({ data: result.rows.map((row) => ({ id: row.id, action: row.action, entityType: row.entity_type, entityId: row.entity_id, metadata: row.metadata, ipAddress: row.ip_address, createdAt: row.created_at, actor: row.actor_email ? { email: row.actor_email } : null })) });
}));
