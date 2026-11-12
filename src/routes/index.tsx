import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, UtensilsCrossed, HeartHandshake, Truck, Sparkles, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PORTALS, type AppRole } from "@/lib/auth";
import { getSurplusListings } from "@/lib/surplus-service";
import { getNgoPartners } from "@/lib/ngo-data";
import { PwaInstallBanner, MobileBottomNavigation } from "@/components/PwaInstallBanner";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Smart Canteen — Less waste, shorter queues, fed communities" },
    { name: "description", content: "AI-powered campus canteen connecting students, canteen staff, admins and verified NGOs to cut food waste." },
    { property: "og:title", content: "Smart Canteen — Campus Food Platform" },
    { property: "og:description", content: "Inventory, demand forecasts, lunch slots and NGO food donations in one place." },
  ] }),
  component: Home,
});

function Home() {
  const posts = useQuery({
    queryKey: ["public-posts"],
    queryFn: async () => (await supabase.from("ngo_posts").select("*, ngo_profiles(org_name, verification_status)").eq("status", "approved").order("created_at", { ascending: false }).limit(6)).data ?? [],
  });
  const impact = useQuery({
    queryKey: ["impact"],
    queryFn: async () => {
      const { data } = await supabase.from("food_preparation_batches").select("prepared_qty,sold_qty,donated_qty,discarded_qty");
      const s = (data ?? []).reduce((a, b) => ({ p: a.p + b.prepared_qty, d: a.d + b.donated_qty, w: a.w + b.discarded_qty }), { p: 0, d: 0, w: 0 });
      return s;
    },
  });

  const [surplusList, setSurplusList] = useState(() => getSurplusListings());
  const [ngoPartnersList, setNgoPartnersList] = useState(() => getNgoPartners());

  useEffect(() => {
    const handleUpdate = () => {
      setSurplusList(getSurplusListings());
      setNgoPartnersList(getNgoPartners());
    };
    window.addEventListener("smart_canteen_surplus_updated", handleUpdate);
    window.addEventListener("smart_canteen_reports_updated", handleUpdate);
    return () => {
      window.removeEventListener("smart_canteen_surplus_updated", handleUpdate);
      window.removeEventListener("smart_canteen_reports_updated", handleUpdate);
    };
  }, []);

  const openListings = surplusList.filter((l) => l.status === "open");
  const liveSurplusPlates = openListings.reduce((sum, l) => sum + l.platesCount, 0);
  const totalRedistributedMeals = ngoPartnersList.reduce(
    (sum, n) => sum + n.stats.totalMealsServed,
    0
  );
  const totalFoodDrives = ngoPartnersList.reduce((sum, n) => sum + n.stats.foodDrives, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A202C] pb-20 md:pb-0">
      {/* PWA & Dual-Device Mode Indicator Banner */}
      <PwaInstallBanner />

      {/* Top Navigation Bar: Deep Teal (#004E64) */}
      <header className="bg-[#004E64] text-white shadow-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/app-logo.png"
              alt="Smart Canteen Logo"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl object-contain bg-white p-0.5 shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Smart Canteen
                <span className="hidden sm:inline bg-[#FF6B35] text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full">
                  Zero Waste
                </span>
              </span>
              <span className="text-[10.5px] sm:text-xs text-emerald-300 font-semibold tracking-wide uppercase">
                Campus Food & Surplus Platform
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/$portal/login"
              params={{ portal: "student" }}
              className="rounded-xl bg-[#FF6B35] hover:bg-[#e85a26] text-white px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Order Now / Sign in</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Live Canteen to NGO Redistribution Monitor Bar (Top Area) */}
      <div className="mx-auto max-w-7xl px-4 pt-1 pb-4">
        <div className="rounded-2xl border-2 border-ngo/30 bg-gradient-to-r from-ngo/10 via-card to-primary/10 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-600"></span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black tracking-wider uppercase text-ngo">
                  Live Counter: Canteen → NGO Food Redistribution
                </span>
                <span className="bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Real-time Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Surplus food prepared at Engineering College Canteen directly claimed and distributed to local communities by verified NGOs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="rounded-xl border bg-card px-3.5 py-2 text-center shadow-xs">
              <div className="text-xl font-black text-ngo font-display leading-tight">
                {liveSurplusPlates} Plates
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase">
                Available for Pickup Now
              </div>
            </div>

            <div className="rounded-xl border bg-card px-3.5 py-2 text-center shadow-xs">
              <div className="text-xl font-black text-primary font-display leading-tight">
                {totalRedistributedMeals.toLocaleString()}+
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase">
                Meals Redistributed
              </div>
            </div>

            <div className="rounded-xl border bg-card px-3.5 py-2 text-center shadow-xs">
              <div className="text-xl font-black text-green-600 dark:text-green-400 font-display leading-tight">
                {totalFoodDrives} Drives
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase">
                Campus Food Drives
              </div>
            </div>

            <div className="rounded-xl border bg-card px-3.5 py-2 text-center shadow-xs">
              <div className="text-xl font-black text-foreground font-display leading-tight">
                {ngoPartnersList.length} Verified
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase">
                Partner NGOs
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          {/* Food Sustainability & Zero Waste Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-xs mb-3">
            <img src="/app-logo.png" alt="Smart Canteen Logo" className="h-5 w-5 rounded-md object-contain shrink-0" />
            <span>Smart Canteen · Zero Waste Campus Food Platform</span>
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] text-[#004E64] font-display">
            Cook what's eaten.<br /><span className="text-[#FF6B35]">Share what's left.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Acche kaam karo, khana waste mat karo. Share surplus meals with people in need, support verified NGOs, and keep our engineering college hunger-free with AI-assisted demand forecasting.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/$portal/login"
              params={{ portal: "ngo" }}
              className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <HeartHandshake className="h-4 w-4" /> Claim Food for NGO
            </Link>
            <Link
              to="/$portal/login"
              params={{ portal: "canteen" }}
              className="rounded-xl border border-primary/20 bg-card hover:bg-muted/80 px-4 py-2.5 text-sm font-semibold text-foreground transition-all"
            >
              Canteen Portal
            </Link>
          </div>
        </div>

        {/* Live NGO Activity Posts Displayed Right at the Top */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-ngo flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ngo opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ngo"></span>
              </span>
              Latest NGO Seva Posts
            </span>
            <span className="text-xs text-muted-foreground">Live Feed</span>
          </div>

          {(posts.data ?? []).length === 0 ? (
            <div className="rounded-2xl border bg-card p-6 text-center shadow-xs">
              <p className="text-sm font-semibold text-foreground">No approved posts yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Verified NGOs will post their campus food distribution drives here.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {(posts.data ?? []).slice(0, 2).map((p) => {
                const hasCaption = p.body?.startsWith("Caption: ");
                const captionText = hasCaption ? p.body.split("\n\n")[0]?.replace("Caption: ", "") : null;
                const detailText = hasCaption ? p.body.split("\n\n").slice(1).join("\n\n") : p.body;

                return (
                  <article key={p.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all">
                    {p.image_url && (
                      <div className="relative h-44 bg-muted">
                        <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
                        {captionText && (
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3 pt-6 text-xs text-white">
                            <span className="font-semibold italic">"{captionText}"</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-3.5 space-y-1.5">
                      <div className="flex items-center gap-1 text-xs font-semibold text-ngo">
                        {p.ngo_profiles?.org_name}
                        {p.ngo_profiles?.verification_status === "verified" ? (
                          <BadgeCheck className="h-3.5 w-3.5" />
                        ) : (
                          <span className="text-muted-foreground">(unverified)</span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-foreground">{p.title}</h3>
                      {detailText && <p className="line-clamp-2 text-xs text-muted-foreground">{detailText}</p>}
                      <div className="pt-1.5 border-t text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>{p.location || "Campus distribution"}</span>
                        {p.beneficiaries != null && <strong className="text-foreground">{p.beneficiaries} people fed</strong>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#004E64] py-14 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">Access Points</span>
              <h2 className="text-3xl font-bold font-display text-white mt-1">Choose your portal</h2>
            </div>
            <p className="text-sm text-white/80 max-w-md">
              Order food, track real-time kitchen preparation, monitor seating capacity, and coordinate surplus donations.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(PORTALS) as AppRole[]).map((r) => (
              <Link
                key={r}
                to="/$portal/login"
                params={{ portal: r }}
                className={`group rounded-2xl p-6 transition-all border ${
                  r === "student"
                    ? "bg-[#FF6B35] text-white border-transparent shadow-lg hover:bg-[#e85a26]"
                    : "bg-white/10 hover:bg-white/15 border-white/15 text-white"
                }`}
              >
                <div className="font-display text-xl font-bold">{PORTALS[r].label}</div>
                <p className="mt-1.5 text-sm opacity-90 leading-relaxed">{PORTALS[r].blurb}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold">
                  {r === "student" ? "Order & View Menu" : "Enter Portal"}{" "}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-3xl font-bold text-primary font-display">From our NGO partners</h2>
        <p className="text-muted-foreground">Activity posts approved by the college admin.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(posts.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">
              No approved posts yet.
            </p>
          )}
          {(posts.data ?? []).map((p) => {
            const hasCaption = p.body?.startsWith("Caption: ");
            const captionText = hasCaption ? p.body.split("\n\n")[0]?.replace("Caption: ", "") : null;
            const detailText = hasCaption
              ? p.body.split("\n\n").slice(1).join("\n\n")
              : p.body;

            return (
              <article key={p.id} className="overflow-hidden rounded-2xl border bg-card flex flex-col shadow-xs">
                {p.image_url && (
                  <div className="relative">
                    <img src={p.image_url} alt={p.title} className="h-48 w-full object-cover" loading="lazy" />
                    {captionText && (
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6 text-xs text-white">
                        <span className="font-medium italic">"{captionText}"</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-ngo">
                      {p.ngo_profiles?.org_name}
                      {p.ngo_profiles?.verification_status === "verified" ? (
                        <BadgeCheck className="h-3.5 w-3.5" />
                      ) : (
                        <span className="text-muted-foreground">(unverified)</span>
                      )}
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-foreground">{p.title}</h3>
                    {detailText && (
                      <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                        {detailText}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t text-xs text-muted-foreground flex flex-wrap gap-2">
                    {[
                      p.location,
                      p.activity_date,
                      p.beneficiaries != null && `${p.beneficiaries} people reached`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <footer className="border-t bg-white dark:bg-card py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/app-logo.png" alt="Smart Canteen Logo" className="h-8 w-8 rounded-lg object-contain bg-white p-0.5 shadow-xs" />
            <span className="text-sm font-bold text-[#004E64] dark:text-white uppercase tracking-wider">
              Smart Canteen Platform
            </span>
          </div>
          <p className="max-w-md text-[11px] leading-relaxed">
            Smart Canteen Management System · Campus sustainability, zero-waste food logistics, live kitchen token tracking, and verified NGO distribution.
          </p>
          <div className="text-[10px] text-muted-foreground/75">
            © {new Date().getFullYear()} Smart Canteen. Designed for Laptop Workflows & Mobile Touch Web App.
          </div>
        </div>
      </footer>

      {/* Touch-Friendly Bottom Navigation for Mobile Devices */}
      <MobileBottomNavigation />
    </div>
  );
}
