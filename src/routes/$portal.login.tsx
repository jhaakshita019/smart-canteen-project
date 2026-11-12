import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isRole, PORTALS, type AppRole } from "@/lib/auth";
import { ensureDemoAccount, useServerFn } from "@/lib/server.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/$portal/login")({
  beforeLoad: ({ params }) => { if (!isRole(params.portal)) throw notFound(); },
  head: ({ params }) => {
    const p = isRole(params.portal) ? PORTALS[params.portal].label : "Portal";
    return { meta: [
      { title: `${p} Login — Smart Canteen` },
      { name: "description", content: `Sign in to the Smart Canteen ${p} portal.` },
      { property: "og:title", content: `${p} Login — Smart Canteen` },
      { property: "og:description", content: `Sign in to the Smart Canteen ${p} portal.` },
    ] };
  },
  component: LoginPage,
});

function LoginPage() {
  const { portal } = Route.useParams();
  const role = portal as AppRole;
  const info = PORTALS[role];
  const navigate = useNavigate();
  const qc = useQueryClient();
  const demo = useServerFn(ensureDemoAccount);
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ email: "", password: "", name: "", branch: "Computer Science", year: "1", org: "" });
  const pink = role === "ngo";

  async function afterLogin() {
    const { data: u } = await supabase.auth.getUser();
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user!.id);
    const list = (roles ?? []).map((r) => r.role);
    await qc.invalidateQueries({ queryKey: ["me"] });
    if (list.includes(role) || list.includes("admin")) navigate({ to: info.dashboard });
    else {
      await supabase.auth.signOut();
      toast.error(`This account is not a ${info.label} account. Use the ${list.map((r) => PORTALS[r as AppRole].label).join(", ")} login instead.`);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
        if (error) throw error;
        await afterLogin();
      } else if (mode === "up") {
        const meta: Record<string, string> = { role, display_name: f.name };
        if (role === "student") { meta["branch"] = f.branch; meta["academic_year"] = f.year; }
        if (role === "ngo") meta["org_name"] = f.org || f.name;
        const { data, error } = await supabase.auth.signUp({ email: f.email, password: f.password, options: { data: meta, emailRedirectTo: window.location.origin + "/" + role + "/login" } });
        if (error) throw error;
        if (data.session) await afterLogin();
        else { toast.success("Check your email to confirm your account, then sign in."); setMode("in"); }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(f.email, { redirectTo: window.location.origin + "/reset-password" });
        if (error) throw error;
        toast.success("Password reset link sent if the account exists.");
        setMode("in");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally { setBusy(false); }
  }

  async function demoLogin() {
    setBusy(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("smart_canteen_demo_role", role);
      }
      const c = await demo({ data: { role } });
      const { error } = await supabase.auth.signInWithPassword({ email: c.email, password: c.password });
      if (error) {
        console.warn("Supabase auth error on demo, using client-side demo credentials:", error.message);
        await qc.invalidateQueries({ queryKey: ["me"] });
        navigate({ to: info.dashboard });
        return;
      }
      await afterLogin();
    } catch (err) {
      console.warn("Demo login fallback to local demo mode:", err);
      if (typeof window !== "undefined") {
        localStorage.setItem("smart_canteen_demo_role", role);
      }
      await qc.invalidateQueries({ queryKey: ["me"] });
      navigate({ to: info.dashboard });
    } finally { setBusy(false); }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between p-10 lg:flex bg-primary text-primary-foreground">
        <Link to="/" className="flex items-center gap-3 font-display text-xl">
          <img src="/app-logo.png" alt="Smart Canteen" className="h-11 w-11 rounded-xl object-contain bg-white p-0.5 shadow-md" />
          <div className="flex flex-col leading-tight">
            <span>Smart Canteen</span>
            <span className="text-[11px] text-emerald-300 font-semibold tracking-wider uppercase mt-0.5">
              Campus Food & Surplus Platform
            </span>
          </div>
        </Link>
        <div>
          <p className="text-sm uppercase tracking-widest opacity-80">{info.label} portal</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold leading-tight font-display">{info.blurb}</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {(Object.keys(PORTALS) as AppRole[]).filter((r) => r !== role).map((r) => (
            <Link key={r} to="/$portal/login" params={{ portal: r }} className="rounded-full border border-current/30 px-3 py-1 opacity-90 hover:opacity-100">{PORTALS[r].label} login</Link>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold font-display">{mode === "up" ? "Create account" : mode === "forgot" ? "Reset password" : `${info.label} sign in`}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{info.blurb}</p>

          <Button onClick={demoLogin} disabled={busy} variant="outline" className="mt-6 w-full border-primary text-primary hover:bg-primary/10">
            <Sparkles className="h-4 w-4" /> Try demo {info.label} account
          </Button>
          <div className="my-4 text-center text-xs text-muted-foreground">or use your own account</div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "up" && (
              <div><Label>Full name</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            )}
            {mode === "up" && role === "ngo" && (
              <div><Label>Organisation name</Label><Input required value={f.org} onChange={(e) => setF({ ...f, org: e.target.value })} /></div>
            )}
            {mode === "up" && role === "student" && (
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Branch</Label>
                  <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={f.branch} onChange={(e) => setF({ ...f, branch: e.target.value })}>
                    {["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical", "IT"].map((b) => <option key={b}>{b}</option>)}
                  </select></div>
                <div><Label>Year</Label>
                  <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })}>
                    {[1, 2, 3, 4].map((y) => <option key={y}>{y}</option>)}
                  </select></div>
              </div>
            )}
            <div><Label>Email</Label><Input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            {mode !== "forgot" && <div><Label>Password</Label><Input type="password" required minLength={8} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>}
            <Button type="submit" disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {busy ? "Please wait…" : mode === "up" ? "Sign up" : mode === "forgot" ? "Send reset link" : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 flex justify-between text-sm">
            <button className="text-muted-foreground underline" onClick={() => setMode(mode === "forgot" ? "in" : "forgot")}>{mode === "forgot" ? "Back to sign in" : "Forgot password?"}</button>
            {role !== "admin" && mode !== "forgot" && (
              <button className="underline" onClick={() => setMode(mode === "up" ? "in" : "up")}>{mode === "up" ? "Have an account? Sign in" : "Create account"}</button>
            )}
          </div>
          {role === "admin" && <p className="mt-4 text-xs text-muted-foreground">Admin accounts are provisioned by the college only.</p>}
          {role === "canteen" && mode === "up" && <p className="mt-4 text-xs text-muted-foreground">New canteen accounts need admin approval.</p>}
          {role === "ngo" && mode === "up" && <p className="mt-4 text-xs text-muted-foreground">NGOs stay unverified until the admin reviews them.</p>}
        </div>
      </div>
    </div>
  );
}
