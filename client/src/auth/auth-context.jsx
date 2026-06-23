/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);

function storedUser() {
  try {
    const value = sessionStorage.getItem("careview_user");
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser);
  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    async login(email, password) {
      const response = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      sessionStorage.setItem("careview_token", response.data.accessToken);
      sessionStorage.setItem("careview_user", JSON.stringify(response.data.user));
      setUser(response.data.user);
      return response.data.user;
    },
    async register(payload) {
      const response = await apiRequest("/auth/register", { method: "POST", body: JSON.stringify(payload) });
      sessionStorage.setItem("careview_token", response.data.accessToken);
      sessionStorage.setItem("careview_user", JSON.stringify(response.data.user));
      setUser(response.data.user);
      return response.data.user;
    },
    logout() {
      sessionStorage.removeItem("careview_token");
      sessionStorage.removeItem("careview_user");
      setUser(null);
    },
  }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
