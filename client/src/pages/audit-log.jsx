import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../components/page-header";
import { ErrorState, LoadingState } from "../components/status";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { apiRequest } from "../lib/api";
import { formatDate } from "../lib/format";

export function AuditLog() {
  const logs = useQuery({ queryKey: ["audit-logs"], queryFn: () => apiRequest("/admin/audit-logs") });
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8">
      <PageHeader eyebrow="Security" title="Audit trail" description="Recent administrative data-import activity." />
      <Card className="p-5">
        {logs.isLoading ? <LoadingState /> : logs.error ? <ErrorState message="Audit history could not be loaded." /> : (
          <Table>
            <TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Administrator</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
            <TableBody>
              {logs.data?.data.map((entry) => <TableRow key={entry.id}><TableCell>{formatDate(entry.createdAt)}</TableCell><TableCell>{entry.actor?.email ?? "System"}</TableCell><TableCell><Badge variant="secondary">{entry.action.replaceAll("_", " ")}</Badge></TableCell><TableCell>{entry.entityType}</TableCell><TableCell className="max-w-md truncate text-muted-foreground">{entry.metadata ? JSON.stringify(entry.metadata) : "--"}</TableCell></TableRow>)}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
