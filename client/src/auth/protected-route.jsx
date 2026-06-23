import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth-context";

export function ProtectedRoute({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "ADMIN" ? "/admin" : "/dashboard"} replace />;
  return <Outlet />;
}
