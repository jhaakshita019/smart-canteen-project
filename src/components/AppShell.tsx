import { useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe, PORTALS, type AppRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MobileBottomNavigation } from "@/components/PwaInstallBanner";

export function AppShell({ role, children }: { role: AppRole; children: ReactNode; tone?: string }) {
  const me = useMe();
  const navigate = useNavigate();
  if (me.isLoading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  const ok = me.data?.roles.includes(role) || (role !== "admin" && me.data?.roles.includes("admin"));
  if (!me.data || !ok) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold font-display">Access denied</h1>
          <p className="mt-2 text-muted-foreground">This dashboard is for {PORTALS[role].label} accounts only.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild><Link to="/">Home</Link></Button>
            <Button variant="outline" onClick={async () => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("smart_canteen_demo_role");
              }
              await supabase.auth.signOut();
              navigate({ to: "/$portal/login", params: { portal: role } });
            }}>Switch account</Button>
          </div>
        </div>
      </div>
    );
  }
  const pending = role === "canteen" && me.data.profile?.status !== "active" && !me.data.roles.includes("admin");
  const head = "bg-[#004E64] text-white shadow-sm border-b border-[#003B4C]";
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-6">
      <header className={head}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5 font-semibold text-white group">
            <img src="/app-logo.png" alt="Smart Canteen" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg object-contain bg-white p-0.5 shadow-xs group-hover:scale-105 transition-transform" />
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-2">
                <span className="font-display text-base sm:text-lg tracking-tight">Smart Canteen</span>
                <span className="rounded-full bg-[#FF6B35] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  {PORTALS[role].label}
                </span>
              </div>
              <span className="text-[10px] text-emerald-300 font-semibold tracking-wider uppercase hidden sm:inline mt-0.5">
                Campus Food & Surplus Platform
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm opacity-90 md:inline">{me.data.profile?.display_name}</span>
            <Notifications userId={me.data.user.id} />
            <Button size="sm" variant="secondary" onClick={async () => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("smart_canteen_demo_role");
              }
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}>
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {pending ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold">Account awaiting approval</h2>
            <p className="mt-2 text-muted-foreground">A college admin must activate canteen staff accounts before you can manage records.</p>
          </div>
        ) : children}
      </main>

      {/* Touch-Friendly Bottom Bar on Mobile */}
      <MobileBottomNavigation />
    </div>
  );
}

function Notifications({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => (await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(30)).data ?? [],
  });
  useEffect(() => {
    const ch = supabase.channel("notif-" + userId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => qc.invalidateQueries({ queryKey: ["notifications", userId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, qc]);
  const unread = (q.data ?? []).filter((n) => !n.read).length;
  return (
    <Popover onOpenChange={async (o) => {
      if (!o && unread) { await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false); qc.invalidateQueries({ queryKey: ["notifications", userId] }); }
    }}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="secondary" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 text-[10px] text-destructive-foreground">{unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b px-4 py-2 text-sm font-semibold">Notifications</div>
        <div className="max-h-96 overflow-auto">
          {(q.data ?? []).length === 0 && <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>}
          {(q.data ?? []).map((n) => (
            <div key={n.id} className={`border-b px-4 py-2 text-sm ${n.read ? "" : "bg-secondary"}`}>
              <div className="font-medium">{n.title}</div>
              <div className="text-muted-foreground">{n.body}</div>
              <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
