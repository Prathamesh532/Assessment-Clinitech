import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./auth/protected-route";
import { AppShell } from "./components/app-shell";
import { LoadingState } from "./components/status";

const LoginPage = lazy(() => import("./pages/login-page").then((module) => ({ default: module.LoginPage })));
const UserDashboard = lazy(() => import("./pages/user-dashboard").then((module) => ({ default: module.UserDashboard })));
const ReportHistory = lazy(() => import("./pages/report-history").then((module) => ({ default: module.ReportHistory })));
const AdminClients = lazy(() => import("./pages/admin-clients").then((module) => ({ default: module.AdminClients })));
const ClientDetails = lazy(() => import("./pages/client-details").then((module) => ({ default: module.ClientDetails })));
const ImportReports = lazy(() => import("./pages/import-reports").then((module) => ({ default: module.ImportReports })));
const AuditLog = lazy(() => import("./pages/audit-log").then((module) => ({ default: module.AuditLog })));

export function App() {
  return <Suspense fallback={<LoadingState label="Loading CareView" />}><Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute role="USER" />}><Route element={<AppShell />}><Route path="/dashboard" element={<UserDashboard />} /><Route path="/reports" element={<ReportHistory />} /></Route></Route><Route element={<ProtectedRoute role="ADMIN" />}><Route element={<AppShell />}><Route path="/admin" element={<AdminClients />} /><Route path="/admin/clients/:clientId" element={<ClientDetails />} /><Route path="/admin/import" element={<ImportReports />} /><Route path="/admin/audit" element={<AuditLog />} /></Route></Route><Route path="*" element={<Navigate to="/login" replace />} /></Routes></Suspense>;
}
