import { Activity, ClipboardList, LogOut, Moon, Search, ShieldCheck, Sun, Upload } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import { useTheme } from "../theme/theme-context";
import { Button } from "./ui/button";

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const admin = user?.role === "ADMIN";
  const links = admin
    ? [{ to: "/admin", label: "Clients", icon: Search, end: true }, { to: "/admin/import", label: "Import reports", icon: Upload }, { to: "/admin/audit", label: "Audit trail", icon: ShieldCheck }]
    : [{ to: "/dashboard", label: "Overview", icon: Activity, end: true }, { to: "/reports", label: "Report history", icon: ClipboardList }];

  return (
    <div className="min-h-screen bg-background text-foreground md:grid md:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 z-10 flex border-b border-border bg-card p-3 md:h-screen md:flex-col md:border-b-0 md:border-r md:p-5">
        <div className="mr-auto flex items-center gap-3 font-display text-lg font-bold md:mb-8 md:mr-0">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><Activity size={20} /></span>
          <span className="hidden sm:inline">CareView</span>
        </div>
        <nav className="flex gap-2 md:flex-col" aria-label="Main navigation">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            >
              <Icon size={18} /> <span className="hidden md:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="ml-2 md:mb-4 md:ml-0 md:mt-auto">
          <Button className="w-full" variant="outline" type="button" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />} <span className="hidden md:inline">{theme === "dark" ? "Light" : "Dark"} mode</span>
          </Button>
        </div>
        <div className="ml-2 flex items-center gap-3 border-border md:ml-0 md:border-t md:pt-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary font-bold text-primary">{user?.name.slice(0, 1).toUpperCase()}</div>
          <div className="hidden min-w-0 flex-1 flex-col md:flex">
            <strong className="truncate text-sm">{user?.name}</strong>
            <span className="text-xs text-muted-foreground">{admin ? "Administrator" : "Patient"}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={17} /></Button>
        </div>
      </aside>
      <main className="min-w-0"><Outlet /></main>
    </div>
  );
}
