import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ClipboardList, FileText, ShieldCheck, Stethoscope } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "../auth/auth-context";
import { MetricCard } from "../components/metric-card";
import { PageHeader } from "../components/page-header";
import { ErrorState, LoadingState } from "../components/status";
import { Card } from "../components/ui/card";
import { apiRequest } from "../lib/api";
import { formatDate } from "../lib/format";

const tone = (value, low, high) => value < low || value > high ? "caution" : "good";

export function UserDashboard() {
  const { user } = useAuth();
  const latest = useQuery({ queryKey: ["latest-report"], queryFn: () => apiRequest("/reports/me/latest") });
  const summary = useQuery({ queryKey: ["report-summary"], queryFn: () => apiRequest("/reports/me/summary") });
  if (latest.isLoading || summary.isLoading) return <LoadingState label="Preparing your dashboard" />;
  if (latest.error || summary.error) return <ErrorState message="Your health dashboard could not be loaded." />;
  const report = latest.data?.data;

  if (!report) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8">
        <PageHeader eyebrow="Patient overview" title={`Welcome, ${user?.name.split(" ")[0]}`} description="Your account is active. Health reports will appear here once an administrator adds your first report." />
        <Card className="grid max-w-5xl gap-6 p-6">
          <div>
            <ClipboardList size={34} />
            <h2 className="mt-3 font-display text-2xl font-bold">No health reports yet</h2>
            <p className="mt-2 text-muted-foreground">This is expected for a newly registered patient. Your profile is ready, but no lab or wellness report has been attached yet.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted p-4"><span className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</span><strong>Admin verifies profile</strong><p className="mt-2 text-sm text-muted-foreground">Admin can find your profile in the client directory.</p></div>
            <div className="rounded-xl border border-border bg-muted p-4"><span className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</span><strong>Report is added</strong><p className="mt-2 text-sm text-muted-foreground">Admin can add a report manually or import it through CSV.</p></div>
            <div className="rounded-xl border border-border bg-muted p-4"><span className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">3</span><strong>Dashboard activates</strong><p className="mt-2 text-sm text-muted-foreground">Your metrics, doctor note, trend chart, and history become visible here.</p></div>
          </div>
          <div className="rounded-lg border-l-4 border-amber-500 bg-amber-500/10 p-4"><span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><ShieldCheck size={15} /> Privacy note</span>Even before reports are added, your account is linked to your own client ID. Other patients cannot see this profile.</div>
        </Card>
      </div>
    );
  }

  const trends = (summary.data?.data.trend ?? []).map((item) => ({ ...item, date: new Date(item.reportDate).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }) }));
  const previous = trends.at(-2);
  return <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8"><PageHeader eyebrow="Patient overview" title={`Good day, ${user?.name.split(" ")[0]}`} description="Here is the latest view of your reported health indicators." actions={<div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm"><CalendarDays size={16} />Updated {formatDate(report.reportDate)}</div>} /><Card className="mb-5 flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between"><div><span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary"><FileText size={15} /> Latest report</span><h2 className="font-display text-2xl font-bold">{formatDate(report.reportDate)}</h2><p className="text-muted-foreground">Report reference <span className="font-mono text-xs">{report.id}</span></p></div><div className="flex max-w-xl gap-3 rounded-xl bg-muted p-4"><Stethoscope size={20} /><div><span className="text-xs uppercase tracking-wide text-muted-foreground">Doctor&apos;s note</span><strong className="block text-sm">{report.doctorNotes}</strong></div></div></Card><div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3"><MetricCard label="Hemoglobin" value={report.hemoglobin} unit="g/dL" reference="12-17" tone={tone(report.hemoglobin, 12, 17)} change={previous ? report.hemoglobin - previous.hemoglobin : undefined} /><MetricCard label="Vitamin D" value={report.vitaminD} unit="ng/mL" reference="20-80" tone={tone(report.vitaminD, 20, 80)} change={previous ? report.vitaminD - previous.vitaminD : undefined} /><MetricCard label="Cholesterol" value={report.cholesterol} unit="mg/dL" reference="below 200" tone={tone(report.cholesterol, 0, 200)} change={previous ? report.cholesterol - previous.cholesterol : undefined} /><MetricCard label="Fasting sugar" value={report.bloodSugarFasting} unit="mg/dL" reference="70-99" tone={tone(report.bloodSugarFasting, 70, 99)} change={previous ? report.bloodSugarFasting - previous.bloodSugarFasting : undefined} /><MetricCard label="Creatinine" value={report.creatinine} unit="mg/dL" reference="0.5-1.3" tone={tone(report.creatinine, 0.5, 1.3)} /><MetricCard label="BMI" value={report.bmi} unit="kg/m2" reference="18.5-24.9" tone={tone(report.bmi, 18.5, 24.9)} change={previous ? report.bmi - previous.bmi : undefined} /></div><Card className="p-5"><div className="mb-4 flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Health trend</p><h2 className="font-display text-xl font-bold">Key indicators over time</h2></div><span className="text-sm text-muted-foreground">{summary.data?.data.totalReports} reports</span></div><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trends}><defs><linearGradient id="healthFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.28} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" /><XAxis dataKey="date" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", color: "hsl(var(--foreground))" }} /><Area type="monotone" dataKey="cholesterol" name="Cholesterol" stroke="hsl(var(--primary))" fill="url(#healthFill)" strokeWidth={2} /><Area type="monotone" dataKey="bloodSugarFasting" name="Fasting sugar" stroke="rgb(217 119 6)" fill="transparent" strokeWidth={2} /></AreaChart></ResponsiveContainer></div><p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">Reference bands are general display guidance and are not a diagnosis. Discuss results with a qualified clinician.</p></Card></div>;
}
