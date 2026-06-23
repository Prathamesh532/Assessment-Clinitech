import { useState } from "react";
import { Activity, ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import { ApiError } from "../lib/api";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("user1@example.com");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("User@12345");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (user) return <Navigate to={user.role === "ADMIN" ? "/admin" : "/dashboard"} replace />;
  async function submit(event) {
    event.preventDefault(); setError(""); setSubmitting(true);
    try {
      if (mode === "register" && password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      const signedIn = mode === "register"
        ? await register({ fullName, email, mobile, password })
        : await login(email, password);
      navigate(signedIn.role === "ADMIN" ? "/admin" : "/dashboard", { replace: true });
    }
    catch (reason) { setError(reason instanceof ApiError ? reason.message : "Unable to continue. Try again."); }
    finally { setSubmitting(false); }
  }
  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    if (nextMode === "register") {
      setEmail("");
      setPassword("");
      setFullName("");
      setMobile("");
      setConfirmPassword("");
    }
  }
  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden overflow-hidden bg-[#123c35] p-12 text-white dark:bg-[#09221d] lg:flex lg:flex-col lg:justify-between xl:p-24">
        <div className="flex items-center gap-3 font-display text-lg font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#123c35]"><Activity size={20} /></span><span>CareView</span></div>
        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-teal-200">A clearer view of your health</p>
          <h1 className="font-display text-6xl font-bold leading-none tracking-[-0.06em] xl:text-7xl">Your reports,<br />understood.</h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-teal-50/80">Review recent results and follow changes over time through one private, focused workspace.</p>
        </div>
        <div className="relative z-10 flex max-w-xl gap-3 text-sm text-teal-50/80"><ShieldCheck size={20} /><span><strong className="block text-white">Protected by role-based access</strong>New patients can create an account, then only see reports attached to their own profile.</span></div>
        <span className="absolute right-[-220px] top-1/4 h-[520px] w-[520px] rounded-full border border-white/10" />
      </section>
      <section className="grid place-items-center bg-card p-6">
        <form className="w-full max-w-md space-y-5" onSubmit={submit}>
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary"><LockKeyhole size={21} /></div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Secure portal</p>
            <h2 className="font-display text-3xl font-bold tracking-tight">{mode === "register" ? "Create patient account" : "Welcome back"}</h2>
            <p className="mt-2 text-muted-foreground">{mode === "register" ? "Start with the essentials. Admins can attach reports to your profile later." : "Sign in with your registered email address."}</p>
          </div>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
            <Button type="button" variant={mode === "login" ? "outline" : "ghost"} onClick={() => switchMode("login")}>Sign in</Button>
            <Button type="button" variant={mode === "register" ? "outline" : "ghost"} onClick={() => switchMode("register")}>Register</Button>
          </div>
          {mode === "register" && <label className="grid gap-2 text-sm font-semibold">Full name<Input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required /></label>}
          <label className="grid gap-2 text-sm font-semibold">Email address<Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          {mode === "register" && <label className="grid gap-2 text-sm font-semibold">Mobile number<Input type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} autoComplete="tel" placeholder="8108509859" required /></label>}
          <label className="grid gap-2 text-sm font-semibold">Password<Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={8} required /></label>
          {mode === "register" && <label className="grid gap-2 text-sm font-semibold">Confirm password<Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></label>}
          {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">{error}</div>}
          <Button className="w-full" disabled={submitting}>{submitting ? "Please wait..." : <>{mode === "register" ? "Create account" : "Sign in"} <ArrowRight size={17} /></>}</Button>
          {mode === "login" && <div className="flex items-center gap-3 text-sm text-muted-foreground"><span>Demo access</span><Button type="button" variant="secondary" size="sm" onClick={() => { setEmail("user1@example.com"); setPassword("User@12345"); }}>Patient</Button><Button type="button" variant="secondary" size="sm" onClick={() => { setEmail("admin@careview.local"); setPassword("Admin@12345"); }}>Admin</Button></div>}
          <p className="text-sm text-muted-foreground">{mode === "register" ? "Optional demographic fields are defaulted now and can be completed later. Reports appear after admin import." : "New patient? Choose Register to create your account."}</p>
        </form>
      </section>
    </main>
  );
}
