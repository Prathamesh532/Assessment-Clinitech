import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

function pageWindow(meta) {
  const total = meta.totalPages;
  const current = meta.page;
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function Pagination({ meta, onChange }) {
  const pages = pageWindow(meta);
  const start = meta.total ? (meta.page - 1) * meta.pageSize + 1 : 0;
  const end = Math.min(meta.total, meta.page * meta.pageSize);

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>Showing {start.toLocaleString("en-IN")}-{end.toLocaleString("en-IN")} of {meta.total.toLocaleString("en-IN")} results</span>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => onChange(meta.page - 1)}><ChevronLeft size={16} /> Previous</Button>
        {pages[0] > 1 && <Button type="button" variant="outline" size="sm" onClick={() => onChange(1)}>1</Button>}
        {pages[0] > 2 && <span>...</span>}
        {pages.map((page) => <Button type="button" key={page} variant={page === meta.page ? "default" : "outline"} size="sm" onClick={() => onChange(page)}>{page}</Button>)}
        {pages.at(-1) < meta.totalPages - 1 && <span>...</span>}
        {pages.at(-1) < meta.totalPages && <Button type="button" variant="outline" size="sm" onClick={() => onChange(meta.totalPages)}>{meta.totalPages}</Button>}
        <Button type="button" variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => onChange(meta.page + 1)}>Next <ChevronRight size={16} /></Button>
      </div>
    </div>
  );
}
