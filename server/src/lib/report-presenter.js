export function presentReport(row) {
  return {
    id: row.report_id,
    clientId: row.client_id,
    reportDate: new Date(row.report_date).toISOString(),
    hemoglobin: Number(row.hemoglobin),
    vitaminD: Number(row.vitamin_d),
    cholesterol: Number(row.cholesterol),
    bloodSugarFasting: Number(row.blood_sugar_fasting),
    creatinine: Number(row.creatinine),
    urineProtein: row.urine_protein,
    bmi: Number(row.bmi),
    doctorNotes: row.doctor_notes,
  };
}
