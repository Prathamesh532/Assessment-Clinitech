import { formatDate, formatNumber } from "../lib/format";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

function urineVariant(value) {
  if (value === "Positive") return "destructive";
  return "secondary";
}

function urineClassName(value) {
  if (value === "Trace") return "bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300";
  if (value === "Negative") return "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300";
  return "";
}

export function ReportTable({ reports }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Report ID</TableHead>
          <TableHead>Hemoglobin</TableHead>
          <TableHead>Vitamin D</TableHead>
          <TableHead>Cholesterol</TableHead>
          <TableHead>Fasting sugar</TableHead>
          <TableHead>BMI</TableHead>
          <TableHead>Urine protein</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>{formatDate(report.reportDate)}</TableCell>
            <TableCell className="font-mono text-xs">{report.id}</TableCell>
            <TableCell>{formatNumber(report.hemoglobin)}</TableCell>
            <TableCell>{formatNumber(report.vitaminD)}</TableCell>
            <TableCell>{formatNumber(report.cholesterol)}</TableCell>
            <TableCell>{formatNumber(report.bloodSugarFasting)}</TableCell>
            <TableCell>{formatNumber(report.bmi)}</TableCell>
            <TableCell><Badge className={urineClassName(report.urineProtein)} variant={urineVariant(report.urineProtein)}>{report.urineProtein}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
