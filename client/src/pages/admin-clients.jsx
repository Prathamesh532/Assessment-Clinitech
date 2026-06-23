import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, FilterX, MapPin, Search, SlidersHorizontal, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/page-header";
import { Pagination } from "../components/pagination";
import { ErrorState, LoadingState } from "../components/status";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useDebounce } from "../hooks/use-debounce";
import { apiRequest } from "../lib/api";

const pageSizes = [10, 15, 25, 50];

export function AdminClients() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [healthCondition, setHealthCondition] = useState("");
  const search = useDebounce(input.trim(), 350);

  const params = useMemo(() => {
    const next = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) next.set("search", search);
    if (gender) next.set("gender", gender);
    if (city) next.set("city", city);
    if (state) next.set("state", state);
    if (healthCondition) next.set("healthCondition", healthCondition);
    return next;
  }, [page, pageSize, search, gender, city, state, healthCondition]);

  const clients = useQuery({
    queryKey: ["admin-clients", page, pageSize, search, gender, city, state, healthCondition],
    queryFn: () => apiRequest(`/admin/clients?${params}`),
  });

  const activeFilters = [
    search ? `Search: ${search}` : null,
    gender ? `Gender: ${gender}` : null,
    city ? `City: ${city}` : null,
    state ? `State: ${state}` : null,
    healthCondition ? `Condition: ${healthCondition}` : null,
  ].filter(Boolean);

  function clearFilters() {
    setInput("");
    setGender("");
    setCity("");
    setState("");
    setHealthCondition("");
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8">
      <PageHeader
        eyebrow="Administration"
        title="Client directory"
        description="Search, filter, and open a complete client profile from one responsive admin table."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm">
            <Users size={17} />
            <strong>{clients.data?.meta.total.toLocaleString("en-IN") ?? "--"}</strong> clients
          </div>
        }
      />
      <Card className="p-5">
        <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(260px,1.6fr)_minmax(145px,0.6fr)_repeat(2,minmax(130px,0.7fr))_minmax(190px,1fr)_minmax(95px,0.4fr)_auto]">
          <div className="flex min-h-11 items-center gap-2 rounded-lg border border-input bg-background px-3">
            <Search size={18} />
            <Input className="border-0 px-0 shadow-none focus-visible:ring-0" value={input} onChange={(event) => { setInput(event.target.value); setPage(1); }} placeholder="Search name, email or mobile - auto searches" />
          </div>
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-input bg-background px-3 text-muted-foreground">
            <SlidersHorizontal size={17} />
            <Select value={gender || "all"} onValueChange={(value) => { setGender(value === "all" ? "" : value); setPage(1); }}>
              <SelectTrigger className="border-0 px-0 shadow-none focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="All genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All genders</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-input bg-background px-3 text-muted-foreground">
            <MapPin size={17} />
            <Input className="border-0 px-0 shadow-none focus-visible:ring-0" value={city} onChange={(event) => { setCity(event.target.value); setPage(1); }} placeholder="City" />
          </label>
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-input bg-background px-3 text-muted-foreground">
            <MapPin size={17} />
            <Input className="border-0 px-0 shadow-none focus-visible:ring-0" value={state} onChange={(event) => { setState(event.target.value); setPage(1); }} placeholder="State" />
          </label>
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-input bg-background px-3 text-muted-foreground">
            <SlidersHorizontal size={17} />
            <Input className="border-0 px-0 shadow-none focus-visible:ring-0" value={healthCondition} onChange={(event) => { setHealthCondition(event.target.value); setPage(1); }} placeholder="Disease / condition" />
          </label>
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground">
            <span>Rows</span>
            <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }}>
              <SelectTrigger className="border-0 px-0 shadow-none focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          {activeFilters.length > 0 && <Button type="button" variant="secondary" size="sm" onClick={clearFilters}><FilterX size={16} />Clear</Button>}
        </div>
        {activeFilters.length > 0 && <div className="mb-4 flex flex-wrap gap-2">{activeFilters.map((filter) => <Badge key={filter} variant="outline">{filter}</Badge>)}</div>}
        {clients.isLoading ? (
          <LoadingState />
        ) : clients.error ? (
          <ErrorState message="The client directory could not be loaded." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Health condition</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead aria-label="Open profile" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.data?.data.map((client) => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                    tabIndex={0}
                    onClick={() => navigate(`/admin/clients/${client.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") navigate(`/admin/clients/${client.id}`);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary font-bold text-primary">{client.fullName.charAt(0)}</span>
                        <div className="flex flex-col"><strong>{client.fullName}</strong><span className="text-xs text-muted-foreground">ID {client.id}</span></div>
                      </div>
                    </TableCell>
                    <TableCell><strong className="block">{client.email}</strong><span className="text-xs text-muted-foreground">{client.mobile}</span></TableCell>
                    <TableCell>{client.city}, {client.state}</TableCell>
                    <TableCell><Badge variant="secondary">{client.healthCondition}</Badge></TableCell>
                    <TableCell><strong>{client._count?.reports ?? 0}</strong></TableCell>
                    <TableCell><span className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground" aria-hidden="true"><ChevronRight size={18} /></span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {clients.data && <Pagination meta={clients.data.meta} onChange={setPage} />}
          </>
        )}
      </Card>
    </div>
  );
}
