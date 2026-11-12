import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { forecastDemand, useServerFn } from "@/lib/server.functions";
import { AppShell, Section, Stat } from "@/components/AppShell";
import { NgoDirectorySection } from "@/components/NgoDirectorySection";
import { CanteenSurplusPostingSection } from "@/components/CanteenSurplusPostingSection";
import { CanteenStudentAttendanceSection } from "@/components/CanteenStudentAttendanceSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/canteen")({
  head: () => ({ meta: [{ title: "Canteen Dashboard — Smart Canteen" }, { name: "description", content: "Inventory, preparation and forecasts." }, { property: "og:title", content: "Canteen Dashboard" }, { property: "og:description", content: "Inventory, preparation and forecasts." }] }),
  component: () => <AppShell role="canteen"><Canteen /></AppShell>,
});

const sel = "h-9 rounded-md border bg-background px-2 text-sm";

function Canteen() {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const d = useQuery({
    queryKey: ["canteen"],
    queryFn: async () => {
      const [stock, menu, batches, seat, reqs, txToday] = await Promise.all([
        supabase.from("ingredient_stock").select("*").order("name"),
        supabase.from("menu_items").select("*").order("name"),
        supabase.from("food_preparation_batches").select("*, menu_items(name)").eq("prep_date", today),
        supabase.from("canteen_seating_status").select("*").maybeSingle(),
        supabase.from("donation_requests").select("*, ngo_profiles(org_name), surplus_food_listings(description,quantity)").in("status", ["requested", "approved"]),
        supabase.from("inventory_transactions").select("txn_type,quantity").eq("txn_date", today),
      ]);
      return { stock: stock.data ?? [], menu: menu.data ?? [], batches: batches.data ?? [], seat: seat.data, reqs: reqs.data ?? [], tx: txToday.data ?? [] };
    },
  });
  const r = () => qc.invalidateQueries({ queryKey: ["canteen"] });
  const fc = useServerFn(forecastDemand);
  const [forecast, setForecast] = useState<Awaited<ReturnType<typeof forecastDemand>> | null>(null);
  const [buy, setBuy] = useState({ item: "", qty: "", cost: "", supplier: "", expiry: "" });
  const [prep, setPrep] = useState({ menu: "", qty: "", period: "Lunch 1" });
  const [seats, setSeats] = useState({ total: "", occ: "" });
  const sum = (t: string) => d.data?.tx.filter((x) => x.txn_type === t).reduce((a, b) => a + Number(b.quantity), 0) ?? 0;
  const tot = (d.data?.batches ?? []).reduce((a, b) => ({ p: a.p + b.prepared_qty, s: a.s + b.sold_qty, dn: a.dn + b.donated_qty, w: a.w + b.discarded_qty }), { p: 0, s: 0, dn: 0, w: 0 });

  async function upd(id: string, field: "sold_qty" | "donated_qty" | "discarded_qty", v: number) {
    const { error } = await supabase.from("food_preparation_batches").update({ [field]: v } as { sold_qty: number }).eq("id", id);
    if (error) toast.error("Sold + donated + discarded cannot exceed prepared"); else r();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#004E64]">Kitchen Operations Console</span>
          <h1 className="text-3xl font-bold font-display text-[#1A202C] mt-0.5">
            Inventory, Food Batches & Prep Tracking
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
            ● Kitchen Online & Synced
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Raw received today" value={sum("purchase")} hint="units mixed" />
        <Stat label="Raw consumed today" value={sum("consumption")} />
        <Stat label="Portions prepared" value={tot.p} />
        <Stat label="Sold / served" value={tot.s} />
        <Stat label="Donated" value={tot.dn} />
        <Stat label="Leftover / discarded" value={`${tot.p - tot.s - tot.dn - tot.w} / ${tot.w}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Record grocery purchase">
          <form className="grid grid-cols-2 gap-2" onSubmit={async (e) => {
            e.preventDefault();
            const { error } = await supabase.from("inventory_transactions").insert({ grocery_item_id: buy.item, txn_type: "purchase", quantity: Number(buy.qty), cost: buy.cost ? Number(buy.cost) : null, supplier: buy.supplier || null, expiry_date: buy.expiry || null });
            if (error) toast.error(error.message); else { toast.success("Purchase saved to ledger"); setBuy({ item: "", qty: "", cost: "", supplier: "", expiry: "" }); r(); }
          }}>
            <select required className={`${sel} col-span-2`} value={buy.item} onChange={(e) => setBuy({ ...buy, item: e.target.value })}>
              <option value="">Select ingredient…</option>{d.data?.stock.map((s) => <option key={s.id!} value={s.id!}>{s.name} ({s.unit})</option>)}
            </select>
            <Input required type="number" step="0.01" min="0.01" placeholder="Quantity" value={buy.qty} onChange={(e) => setBuy({ ...buy, qty: e.target.value })} />
            <Input type="number" step="0.01" placeholder="Cost ₹" value={buy.cost} onChange={(e) => setBuy({ ...buy, cost: e.target.value })} />
            <Input placeholder="Supplier" value={buy.supplier} onChange={(e) => setBuy({ ...buy, supplier: e.target.value })} />
            <Input type="date" value={buy.expiry} onChange={(e) => setBuy({ ...buy, expiry: e.target.value })} />
            <Button type="submit" className="col-span-2">Save purchase</Button>
          </form>
        </Section>
        <Section title="Record food preparation">
          <form className="grid grid-cols-3 gap-2" onSubmit={async (e) => {
            e.preventDefault();
            const { error } = await supabase.rpc("record_preparation", { _menu_item: prep.menu, _qty: Number(prep.qty), _period: prep.period });
            if (error) toast.error(error.message); else { toast.success("Batch saved; ingredients deducted by recipe"); setPrep({ ...prep, qty: "" }); r(); }
          }}>
            <select required className={`${sel} col-span-3`} value={prep.menu} onChange={(e) => setPrep({ ...prep, menu: e.target.value })}>
              <option value="">Select dish…</option>{d.data?.menu.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <Input required type="number" min={1} placeholder="Portions" value={prep.qty} onChange={(e) => setPrep({ ...prep, qty: e.target.value })} />
            <select className={sel} value={prep.period} onChange={(e) => setPrep({ ...prep, period: e.target.value })}>{["Breakfast", "Lunch 1", "Lunch 2", "Snacks"].map((x) => <option key={x}>{x}</option>)}</select>
            <Button type="submit">Save batch</Button>
          </form>
        </Section>
      </div>

      <Section title="Today's batches (edit sold / donated / discarded)">
        {d.data?.batches.length === 0 && <p className="text-sm text-muted-foreground">No batches recorded today.</p>}
        <div className="space-y-2">
          {d.data?.batches.map((b) => (
            <div key={b.id} className="grid grid-cols-2 items-center gap-2 border-b pb-2 text-sm md:grid-cols-7">
              <div className="col-span-2 font-semibold">{b.menu_items?.name} <span className="text-muted-foreground">· {b.lunch_period}</span></div>
              <div>Prepared {b.prepared_qty}</div>
              {(["sold_qty", "donated_qty", "discarded_qty"] as const).map((f) => (
                <label key={f} className="flex items-center gap-1">{f.split("_")[0]}<Input type="number" min={0} defaultValue={b[f]} className="h-8" onBlur={(e) => Number(e.target.value) !== b[f] && upd(b.id, f, Number(e.target.value))} /></label>
              ))}
              <div className="flex items-center gap-1">Left {b.prepared_qty - b.sold_qty - b.donated_qty - b.discarded_qty}
                {b.prepared_qty - b.sold_qty - b.donated_qty - b.discarded_qty > 0 && (
                  <Button size="sm" variant="outline" onClick={async () => {
                    const left = b.prepared_qty - b.sold_qty - b.donated_qty - b.discarded_qty;
                    const { error } = await supabase.from("surplus_food_listings").insert({ batch_id: b.id, description: b.menu_items?.name ?? "Food", quantity: left, available_until: new Date(Date.now() + 3 * 3600e3).toISOString() });
                    if (error) toast.error(error.message); else toast.success("Listed for verified NGOs");
                  }}>Offer to NGOs</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="What should we buy next?">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground"><tr><th>Ingredient</th><th>Stock</th><th>Min</th><th>Avg/day (14d)</th><th>Expiry</th><th>Suggestion</th></tr></thead>
            <tbody>
              {d.data?.stock.map((s) => {
                const cur = Number(s.current_stock), min = Number(s.min_stock), avg = Number(s.avg_daily_use);
                const need = Math.max(0, avg * 3 + min - cur);
                const exp = s.next_expiry && new Date(s.next_expiry).getTime() - Date.now() < 3 * 864e5;
                return (
                  <tr key={s.id!} className="border-t">
                    <td className="py-1 font-medium">{s.name}</td><td>{cur.toFixed(1)} {s.unit}</td><td>{min}</td><td>{avg.toFixed(2)}</td>
                    <td className={exp ? "text-destructive" : ""}>{s.next_expiry ?? "—"}</td>
                    <td className={cur < min ? "font-semibold text-destructive" : need > 0 ? "text-warning" : "text-success"}>
                      {need > 0 ? `Buy ≈${need.toFixed(1)} ${s.unit} (3-day use + safety stock)` : "Sufficient"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="AI demand forecast (tomorrow)" action={<Button size="sm" onClick={async () => { try { setForecast(await fc()); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } }}>Run forecast</Button>}>
          {!forecast && <p className="text-sm text-muted-foreground">Estimates from recorded batches (last 28 days). Not observed values.</p>}
          {forecast?.rows.map((x) => <div key={x.dish} className="flex justify-between border-b py-1 text-sm"><span>{x.dish}</span><span>{x.suggestedPrep == null ? "No history" : `Prep ${x.suggestedPrep} (demand ≈${x.expectedDemand}, ${x.confidence}, n=${x.samples})`}</span></div>)}
          {forecast?.summary && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">{forecast.summary}</p>}
        </Section>
        <Section title="Canteen Seating Status">
          <form className="flex gap-2" onSubmit={async (e) => {
            e.preventDefault();
            const { error } = await supabase.from("canteen_seating_status").update({ total_seats: Number(seats.total || d.data?.seat?.total_seats), occupied_seats: Number(seats.occ), updated_at: new Date().toISOString() }).eq("id", 1);
            if (error) toast.error(error.message); else { toast.success("Seating updated"); r(); }
          }}>
            <Input type="number" min={0} placeholder={`Total (${d.data?.seat?.total_seats ?? 0})`} value={seats.total} onChange={(e) => setSeats({ ...seats, total: e.target.value })} />
            <Input type="number" min={0} required placeholder={`Occupied (${d.data?.seat?.occupied_seats ?? 0})`} value={seats.occ} onChange={(e) => setSeats({ ...seats, occ: e.target.value })} />
            <Button type="submit">Update</Button>
          </form>
          <div className="mt-3 text-xs text-muted-foreground">
            Current seating: <strong>{d.data?.seat?.occupied_seats ?? 0}</strong> occupied of <strong>{d.data?.seat?.total_seats ?? 0}</strong> total seats.
          </div>
        </Section>
      </div>

      {/* 50 Students Live Attendance & Meal Choice Tracking (Canteen Food vs Home Tiffin) */}
      <CanteenStudentAttendanceSection />

      {/* Canteen Staff Authority: Post Surplus Food with Plates Count & Photo + Real-time Pickup Notifications */}
      <CanteenSurplusPostingSection />

      {/* 10 Registered NGOs & Their Seva Impact Reports */}
      <NgoDirectorySection
        currentRole="canteen"
        title="Registered NGO Partners & Seva Reports (10 NGOs)"
        subtitle="Verify which NGO partners collect canteen surplus and view their official field seva reports."
      />
    </div>
  );
}
