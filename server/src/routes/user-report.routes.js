import { Router } from "express";
import { query } from "../db.js";
import { asyncHandler } from "../lib/async-handler.js";
import { HttpError } from "../lib/http-error.js";
import { paginationMeta } from "../lib/pagination.js";
import { presentReport } from "../lib/report-presenter.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { reportListSchema } from "../schemas/report.schema.js";

export const userReportRouter = Router();
userReportRouter.use(requireAuth, requireRole("USER"));

function clientIdFrom(request) {
  if (!request.auth.clientId) throw new HttpError(403, "This account is not linked to a client profile");
  return request.auth.clientId;
}

userReportRouter.get("/latest", asyncHandler(async (request, response) => {
  const result = await query("SELECT * FROM health_reports WHERE client_id = $1 ORDER BY report_date DESC LIMIT 1", [clientIdFrom(request)]);
  response.json({ data: result.rows[0] ? presentReport(result.rows[0]) : null });
}));

userReportRouter.get("/summary", asyncHandler(async (request, response) => {
  const result = await query("SELECT * FROM health_reports WHERE client_id = $1 ORDER BY report_date ASC", [clientIdFrom(request)]);
  const reports = result.rows.map(presentReport);
  const average = (field) => reports.length ? reports.reduce((sum, report) => sum + report[field], 0) / reports.length : null;
  response.json({ data: {
    totalReports: reports.length,
    averages: { hemoglobin: average("hemoglobin"), vitaminD: average("vitaminD"), cholesterol: average("cholesterol"), bloodSugarFasting: average("bloodSugarFasting"), creatinine: average("creatinine"), bmi: average("bmi") },
    trend: reports.map(({ reportDate, hemoglobin, vitaminD, cholesterol, bloodSugarFasting, bmi }) => ({ reportDate, hemoglobin, vitaminD, cholesterol, bloodSugarFasting, bmi })),
  } });
}));

userReportRouter.get("/", validate("query", reportListSchema), asyncHandler(async (request, response) => {
  const input = request.validated.query;
  const values = [clientIdFrom(request)];
  const conditions = ["client_id = $1"];
  if (input.from) { values.push(input.from); conditions.push(`report_date >= $${values.length}`); }
  if (input.to) { values.push(input.to); conditions.push(`report_date <= $${values.length}`); }
  const where = conditions.join(" AND ");
  const countResult = await query(`SELECT COUNT(*)::int AS total FROM health_reports WHERE ${where}`, values);
  values.push(input.pageSize, (input.page - 1) * input.pageSize);
  const rows = await query(`SELECT * FROM health_reports WHERE ${where} ORDER BY report_date DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
  response.json({ data: rows.rows.map(presentReport), meta: paginationMeta(countResult.rows[0].total, input) });
}));
