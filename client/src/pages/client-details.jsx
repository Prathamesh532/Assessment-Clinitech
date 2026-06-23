import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, HeartPulse, Mail, MapPin, Phone, PlusCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../components/page-header";
import { ReportTable } from "../components/report-table";
import { ErrorState, LoadingState } from "../components/status";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ApiError, apiRequest } from "../lib/api";

const initialReport = {
  reportDate: new Date().toISOString().slice(0, 10),
  hemoglobin: "13.2",
  vitaminD: "32",
  cholesterol: "178",
  bloodSugarFasting: "92",
  creatinine: "0.9",
  urineProtein: "Negative",
  bmi: "23.4",
  doctorNotes: "Initial report added from admin portal.",
};

export function ClientDetails() {
  const { clientId } = useParams();
  const queryClient = useQueryClient();
  const [report, setReport] = useState(initialReport);
  const client = useQuery({ queryKey: ["client", clientId], queryFn: () => apiRequest(`/admin/clients/${clientId}`), enabled: Boolean(clientId) });
  const reports = useQuery({ queryKey: ["client-reports", clientId], queryFn: () => apiRequest(`/admin/clients/${clientId}/reports?page=1&pageSize=20`), enabled: Boolean(clientId) });
  const createReport = useMutation({
    mutationFn: () => apiRequest(`/admin/clients/${clientId}/reports`, { method: "POST", body: JSON.stringify(report) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["client-reports", clientId] });
      setReport(initialReport);
    },
  });

  if (client.isLoading || reports.isLoading) return <LoadingState label="Loading client profile" />;
  if (client.error || reports.error || !client.data) return <ErrorState message="The client profile could not be loaded." />;

  const person = client.data.data;
  const update = (field) => (event) => setReport((current) => ({ ...current, [field]: event.target.value }));

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8">
      <Link className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary" to="/admin"><ArrowLeft size={16} />Back to clients</Link>
      <PageHeader eyebrow={`Client ID ${person.id}`} title={person.fullName} description={`${person.age} years - ${person.gender}`} />
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="p-5 text-center">
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-secondary text-2xl font-bold text-primary">{person.fullName.charAt(0)}</div>
          <h2 className="font-display text-xl font-bold">{person.fullName}</h2>
          <Badge className="mt-3" variant="secondary">{person.healthCondition}</Badge>
          <dl className="mt-6 divide-y divide-border border-t border-border text-left">
            <div className="py-3"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><Mail size={16} />Email</dt><dd className="mt-1 pl-6 text-sm font-semibold">{person.email}</dd></div>
            <div className="py-3"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><Phone size={16} />Mobile</dt><dd className="mt-1 pl-6 text-sm font-semibold">{person.mobile}</dd></div>
            <div className="py-3"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin size={16} />Location</dt><dd className="mt-1 pl-6 text-sm font-semibold">{person.city}, {person.state}</dd></div>
            <div className="py-3"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><BriefcaseBusiness size={16} />Occupation</dt><dd className="mt-1 pl-6 text-sm font-semibold">{person.occupation}</dd></div>
            <div className="py-3"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><HeartPulse size={16} />Wellness goal</dt><dd className="mt-1 pl-6 text-sm font-semibold">{person.beautyGoal}</dd></div>
          </dl>
        </Card>
        <Card className="p-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Most recent report</p>
          {person.latestReport ? (
            <>
              <h2 className="font-display text-2xl font-bold">{new Date(person.latestReport.reportDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</h2>
              <div className="my-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg bg-muted p-4"><span className="text-xs uppercase tracking-wide text-muted-foreground">Hemoglobin</span><strong className="mt-1 block font-display text-2xl">{person.latestReport.hemoglobin} <small className="font-sans text-xs">g/dL</small></strong></div>
                <div className="rounded-lg bg-muted p-4"><span className="text-xs uppercase tracking-wide text-muted-foreground">Vitamin D</span><strong className="mt-1 block font-display text-2xl">{person.latestReport.vitaminD} <small className="font-sans text-xs">ng/mL</small></strong></div>
                <div className="rounded-lg bg-muted p-4"><span className="text-xs uppercase tracking-wide text-muted-foreground">Cholesterol</span><strong className="mt-1 block font-display text-2xl">{person.latestReport.cholesterol} <small className="font-sans text-xs">mg/dL</small></strong></div>
                <div className="rounded-lg bg-muted p-4"><span className="text-xs uppercase tracking-wide text-muted-foreground">BMI</span><strong className="mt-1 block font-display text-2xl">{person.latestReport.bmi}</strong></div>
              </div>
              <div className="rounded-lg border-l-4 border-amber-500 bg-amber-500/10 p-4"><span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Doctor&apos;s note</span>{person.latestReport.doctorNotes}</div>
            </>
          ) : <p>No reports available. Add the first report below to activate the patient dashboard.</p>}
        </Card>
      </div>
      <Card className="mt-5 p-5">
        <div className="mb-5 flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Manual entry</p><h2 className="font-display text-xl font-bold">Add health report</h2></div><PlusCircle size={22} /></div>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => { event.preventDefault(); createReport.mutate(); }}>
          <label className="grid gap-2 text-sm font-semibold">Report date<Input type="date" value={report.reportDate} onChange={update("reportDate")} required /></label>
          <label className="grid gap-2 text-sm font-semibold">Hemoglobin<Input type="number" step="0.1" value={report.hemoglobin} onChange={update("hemoglobin")} required /></label>
          <label className="grid gap-2 text-sm font-semibold">Vitamin D<Input type="number" step="0.1" value={report.vitaminD} onChange={update("vitaminD")} required /></label>
          <label className="grid gap-2 text-sm font-semibold">Cholesterol<Input type="number" step="0.1" value={report.cholesterol} onChange={update("cholesterol")} required /></label>
          <label className="grid gap-2 text-sm font-semibold">Fasting sugar<Input type="number" step="0.1" value={report.bloodSugarFasting} onChange={update("bloodSugarFasting")} required /></label>
          <label className="grid gap-2 text-sm font-semibold">Creatinine<Input type="number" step="0.01" value={report.creatinine} onChange={update("creatinine")} required /></label>
          <label className="grid gap-2 text-sm font-semibold">
            Urine protein
            <Select value={report.urineProtein} onValueChange={(value) => setReport((current) => ({ ...current, urineProtein: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Negative">Negative</SelectItem>
                <SelectItem value="Trace">Trace</SelectItem>
                <SelectItem value="Positive">Positive</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">BMI<Input type="number" step="0.1" value={report.bmi} onChange={update("bmi")} required /></label>
          <label className="grid gap-2 text-sm font-semibold md:col-span-2 xl:col-span-3">Doctor notes<Input value={report.doctorNotes} onChange={update("doctorNotes")} required /></label>
          <Button disabled={createReport.isPending}>{createReport.isPending ? "Adding report..." : "Add report"}</Button>
        </form>
        {createReport.error && <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{createReport.error instanceof ApiError ? createReport.error.message : "Report could not be added"}</div>}
        {createReport.isSuccess && <div className="mt-4 flex items-center gap-3 rounded-lg bg-secondary p-4 text-primary"><CheckCircle2 size={20} /><div className="flex flex-col"><strong>Report added</strong><span className="text-sm">The patient dashboard now has data.</span></div></div>}
      </Card>
      <Card className="mt-5 p-5">
        <div className="mb-5 flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Health records</p><h2 className="font-display text-xl font-bold">Report history</h2></div><span className="text-sm text-muted-foreground">{person._count?.reports ?? 0} total</span></div>
        {reports.data?.data.length ? <ReportTable reports={reports.data.data} /> : <p>No reports available.</p>}
      </Card>
    </div>
  );
}
