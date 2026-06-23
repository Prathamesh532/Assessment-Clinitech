import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "./ui/card";
import { formatNumber } from "../lib/format";

export function MetricCard({ label, value, unit, reference, tone, change }) {
  const ChangeIcon = change == null || change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;
  const toneClass = tone === "caution" ? "bg-amber-500" : tone === "critical" ? "bg-destructive" : "bg-primary";
  return (
    <Card className="relative overflow-hidden p-5">
      <span className={`absolute inset-y-0 left-0 w-1 ${toneClass}`} />
      <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{label}</span><span className={`h-2 w-2 rounded-full ${toneClass}`} /></div>
      <div className="my-3 font-display text-3xl font-bold">{formatNumber(value)} <small className="font-sans text-sm font-medium text-muted-foreground">{unit}</small></div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Ref. {reference}</span>
        {change != null && <span className="flex items-center gap-1"><ChangeIcon size={14} />{Math.abs(change).toFixed(1)}</span>}
      </div>
    </Card>
  );
}
