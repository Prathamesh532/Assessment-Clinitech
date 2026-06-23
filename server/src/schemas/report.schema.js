import { z } from "zod";
import { paginationSchema } from "./common.schema.js";
export const reportListSchema = paginationSchema.extend({ from: z.coerce.date().optional(), to: z.coerce.date().optional() });
export const createReportSchema = z.object({
  reportDate: z.coerce.date(),
  hemoglobin: z.coerce.number().min(1).max(30),
  vitaminD: z.coerce.number().min(0).max(250),
  cholesterol: z.coerce.number().min(50).max(700),
  bloodSugarFasting: z.coerce.number().min(20).max(700),
  creatinine: z.coerce.number().min(0.1).max(20),
  urineProtein: z.enum(["Negative", "Trace", "Positive"]),
  bmi: z.coerce.number().min(10).max(80),
  doctorNotes: z.string().trim().min(1).max(1000),
});
export const healthReportCsvRowSchema = z.object({
  report_id: z.string().trim().min(1).max(50), client_id: z.coerce.number().int().positive(), report_date: z.coerce.date(),
  hemoglobin: z.coerce.number().min(1).max(30), vitamin_d: z.coerce.number().min(0).max(250), cholesterol: z.coerce.number().min(50).max(700),
  blood_sugar_fasting: z.coerce.number().min(20).max(700), creatinine: z.coerce.number().min(0.1).max(20), urine_protein: z.enum(["Negative", "Trace", "Positive"]),
  bmi: z.coerce.number().min(10).max(80), doctor_notes: z.string().trim().min(1).max(1000),
});
