import { describe, expect, it } from "vitest";
import { healthReportCsvRowSchema } from "../src/schemas/report.schema.js";

describe("health report CSV validation", () => {
  const validRow = { report_id: "RPT-101", client_id: "1", report_date: "2026-05-01", hemoglobin: "13.2", vitamin_d: "34", cholesterol: "190", blood_sugar_fasting: "92", creatinine: "0.86", urine_protein: "Negative", bmi: "24.1", doctor_notes: "Stable values" };
  it("coerces numeric CSV values", () => {
    const result = healthReportCsvRowSchema.parse(validRow);
    expect(result.client_id).toBe(1);
    expect(result.bmi).toBe(24.1);
    expect(result.report_date).toBeInstanceOf(Date);
  });
  it("rejects an unsafe clinical value", () => expect(healthReportCsvRowSchema.safeParse({ ...validRow, bmi: "500" }).success).toBe(false));
});
