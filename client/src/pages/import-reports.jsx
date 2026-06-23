import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, FileSpreadsheet, UploadCloud } from "lucide-react";
import { PageHeader } from "../components/page-header";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ApiError, apiRequest } from "../lib/api";

export function ImportReports() {
  const [file, setFile] = useState(null);
  const mutation = useMutation({
    mutationFn: async (selected) => {
      const form = new FormData();
      form.append("file", selected);
      return apiRequest("/admin/reports/import", { method: "POST", body: form });
    },
  });
  function submit(event) {
    event.preventDefault();
    if (file) mutation.mutate(file);
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8">
      <PageHeader eyebrow="Data operations" title="Import health reports" description="Upload validated CSV or Excel report rows and attach them to existing client profiles." />
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
        <form className="grid gap-4" onSubmit={submit}>
          <label className={`flex min-h-72 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-input bg-muted p-6 text-center text-muted-foreground ${file ? "border-solid bg-secondary text-primary" : ""}`}>
            <input className="sr-only" type="file" accept=".csv,text/csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            {file ? (
              <>
                <FileSpreadsheet size={34} />
                <strong className="text-foreground">{file.name}</strong>
                <span>{(file.size / 1024).toFixed(1)} KB - Ready to validate</span>
              </>
            ) : (
              <>
                <UploadCloud size={36} />
                <strong className="text-foreground">Choose CSV or Excel file</strong>
                <span>or drag it here - maximum 2 MB</span>
              </>
            )}
          </label>
          <Button disabled={!file || mutation.isPending}>{mutation.isPending ? "Validating and importing..." : "Import reports"}</Button>
          {mutation.error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{mutation.error instanceof ApiError ? mutation.error.message : "Import failed"}</div>}
          {mutation.data && <div className="flex items-center gap-3 rounded-lg bg-secondary p-4 text-primary"><CheckCircle2 size={22} /><div className="flex flex-col"><strong>Import complete</strong><span className="text-sm">{mutation.data.data.imported} added - {mutation.data.data.skippedDuplicates} duplicates skipped</span></div></div>}
        </form>
        </Card>
        <Card className="p-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">CSV/XLSX requirements</p>
          <h2 className="font-display text-xl font-bold">Before you upload</h2>
          <ol className="my-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
            <li>Use the exact header names shown below.</li>
            <li>Each client ID must already exist.</li>
            <li>Dates must use YYYY-MM-DD.</li>
            <li>The entire file is rejected when a row is invalid.</li>
          </ol>
          <code className="block rounded-lg bg-primary p-4 text-xs leading-6 text-primary-foreground">report_id, client_id, report_date, hemoglobin, vitamin_d, cholesterol, blood_sugar_fasting, creatinine, urine_protein, bmi, doctor_notes</code>
          <p className="mt-4 text-sm text-muted-foreground">Duplicate report IDs are safely skipped and every import attempt is written to the audit trail.</p>
        </Card>
      </div>
    </div>
  );
}
