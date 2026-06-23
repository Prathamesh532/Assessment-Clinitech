import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../components/page-header";
import { Pagination } from "../components/pagination";
import { ReportTable } from "../components/report-table";
import { EmptyState, ErrorState, LoadingState } from "../components/status";
import { Card } from "../components/ui/card";
import { apiRequest } from "../lib/api";

export function ReportHistory() {
  const [page, setPage] = useState(1);
  const reports = useQuery({ queryKey: ["reports", page], queryFn: () => apiRequest(`/reports/me?page=${page}&pageSize=10`) });
  return <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8"><PageHeader eyebrow="Personal records" title="Report history" description="Review your health reports in reverse chronological order." /><Card className="p-5">{reports.isLoading ? <LoadingState /> : reports.error ? <ErrorState message="Report history could not be loaded." /> : !reports.data?.data.length ? <EmptyState title="No reports yet" description="Your account is ready. Reports will appear here after an administrator adds or imports them." /> : <><ReportTable reports={reports.data.data} /><Pagination meta={reports.data.meta} onChange={setPage} /></>}</Card></div>;
}
