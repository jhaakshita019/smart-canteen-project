import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, Section, Stat } from "@/components/AppShell";
import { useMe } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getStudentAttendanceList,
  updateStudentAttendance,
  type StudentAttendanceRecord,
} from "@/lib/attendance-service";
import {
  CheckCircle2,
  XCircle,
  Utensils,
  Briefcase,
  CalendarCheck,
  UserCheck,
  ShoppingBag,
  Clock,
  Flame,
  Check,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/student")({
  head: () => ({
    meta: [
      { title: "Student Canteen Ordering & Dashboard — Smart Canteen" },
      { name: "description", content: "Order fresh food, active cart, attendance, meal choice, menu, and seating." },
      { property: "og:title", content: "Student Canteen Ordering" },
      { property: "og:description", content: "Order fresh food, active cart, attendance, meal choice, menu, and seating." },
    ],
  }),
  component: () => (
    <AppShell role="student">
      <Student />
    </AppShell>
  ),
});

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface ActiveOrder {
  id: string;
  items: string[];
  total: number;
  status: "preparing" | "ready";
  token: string;
  time: string;
}

function Student() {
  const me = useMe();
  const p = me.data?.profile;

  const [studentRec, setStudentRec] = useState<StudentAttendanceRecord | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([
    {
      id: "ord-101",
      items: ["1x Paneer Butter Masala Thali", "1x Masala Buttermilk"],
      total: 110,
      status: "ready", // Emerald Green (#10B981)
      token: "T-42",
      time: "Just now",
    },
    {
      id: "ord-102",
      items: ["1x Crisp Masala Dosa"],
      total: 50,
      status: "preparing", // Warm Amber (#F59E0B)
      token: "T-48",
      time: "5 mins ago",
    },
  ]);

  function reloadStudent() {
    const list = getStudentAttendanceList();
    const current = list.find((s) => s.isCurrentUser) || list[0];
    setStudentRec(current);
  }

  useEffect(() => {
    reloadStudent();
    const handleUpdate = () => reloadStudent();
    window.addEventListener("smart_canteen_attendance_updated", handleUpdate);
    return () => window.removeEventListener("smart_canteen_attendance_updated", handleUpdate);
  }, []);

  const d = useQuery({
    queryKey: ["student-dash", p?.branch],
    queryFn: async () => {
      const [menu, seat, ann, sched] = await Promise.all([
        supabase.from("menu_items").select("*").order("name"),
        supabase.from("canteen_seating_status").select("*").maybeSingle(),
        supabase
          .from("announcements")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("lunch_break_schedules")
          .select("*")
          .eq("branch", p?.branch ?? "")
          .eq("academic_year", p?.academic_year ?? 0),
      ]);
      return { menu: menu.data ?? [], seat: seat.data, ann: ann.data ?? [], sched: sched.data ?? [] };
    },
    enabled: !!p,
    refetchInterval: 30000,
  });

  const today = new Date().getDay();
  const slot = d.data?.sched.find((s) => s.day_of_week === today);
  const seat = d.data?.seat;

  const isPresent = studentRec?.attendance === "present";
  const choice = studentRec?.foodChoice;

  function handleMarkAttendance(status: "present" | "absent") {
    if (!studentRec) return;
    const nextChoice = status === "absent" ? "not_eating" : choice === "not_eating" ? "canteen" : choice || "canteen";
    updateStudentAttendance(studentRec.id, status, nextChoice);
    toast.success(status === "present" ? "Marked as Present today!" : "Marked as Absent today");
  }

  function handleFoodChoice(newChoice: "canteen" | "tiffin") {
    if (!studentRec) return;
    updateStudentAttendance(studentRec.id, "present", newChoice);
    toast.success(
      newChoice === "canteen"
        ? "Canteen Food selected! Kitchen notified to prepare your plate."
        : "Tiffin / Home Food recorded! Canteen notified to save preparation."
    );
  }

  const menuItems = d.data?.menu ?? [];
  const categories = ["All", ...Array.from(new Set(menuItems.map((m) => m.category).filter(Boolean)))];

  const filteredMenu = menuItems.filter((item) => {
    if (selectedCategory === "All") return true;
    return item.category === selectedCategory;
  });

  const cartItemsArray = Object.values(cart);
  const totalCartCount = cartItemsArray.reduce((acc, it) => acc + it.qty, 0);
  const totalCartPrice = cartItemsArray.reduce((acc, it) => acc + it.qty * it.price, 0);

  function addToCart(item: { id: string; name: string; price: number }) {
    setCart((prev) => {
      const existing = prev[item.id];
      const nextQty = existing ? existing.qty + 1 : 1;
      return {
        ...prev,
        [item.id]: { id: item.id, name: item.name, price: item.price, qty: nextQty },
      };
    });
    toast.success(`Added ${item.name} to order!`);
  }

  function removeFromCart(id: string) {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      if (existing.qty <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return {
        ...prev,
        [id]: { ...existing, qty: existing.qty - 1 },
      };
    });
  }

  function handleCheckoutOrder() {
    if (totalCartCount === 0) return;
    const newOrder: ActiveOrder = {
      id: "ord-" + Date.now().toString().slice(-4),
      items: cartItemsArray.map((it) => `${it.qty}x ${it.name}`),
      total: totalCartPrice,
      status: "preparing",
      token: "T-" + Math.floor(10 + Math.random() * 90),
      time: "Just now",
    };
    setActiveOrders((prev) => [newOrder, ...prev]);
    setCart({});
    toast.success(`Order Placed! Token #${newOrder.token}. Sent to kitchen display.`, { duration: 6000 });
  }

  return (
    <div className="space-y-6">
      {/* Active Orders Status Strip (High-Contrast Status Badges) */}
      {activeOrders.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b pb-2">
            <h3 className="font-bold text-sm text-[#004E64] uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[#FF6B35]" /> Live Order Status ({activeOrders.length})
            </h3>
            <span className="text-xs text-muted-foreground">Kitchen Real-Time Queue</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {activeOrders.map((ord) => (
              <div
                key={ord.id}
                className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-3.5 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2 py-0.5 rounded-md">
                      {ord.token}
                    </span>
                    <span className="text-xs text-muted-foreground">{ord.time}</span>
                  </div>
                  <div className="text-xs font-semibold text-[#1A202C] mt-1 line-clamp-1">
                    {ord.items.join(", ")}
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">Total: ₹{ord.total}</div>
                </div>

                <div className="text-right shrink-0">
                  {ord.status === "ready" ? (
                    <span className="inline-flex items-center gap-1.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
                      <Check className="h-3.5 w-3.5 stroke-[3]" /> Ready for Pickup
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 text-xs font-bold px-3 py-1.5 rounded-full">
                      <Clock className="h-3.5 w-3.5 animate-spin" /> Preparing in Kitchen
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Attendance & Canteen Meal Choice Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#004E64] text-white">
                <CalendarCheck className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-bold font-display text-[#1A202C]">
                Daily Attendance & Lunch Schedule
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Confirm your campus presence and meal option (Canteen plate vs Home Tiffin) to calibrate kitchen prep.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPresent ? (
              <span className="inline-flex items-center gap-1.5 bg-[#10B981]/15 text-[#10B981] text-xs font-bold px-3 py-1 rounded-full border border-[#10B981]/30">
                <CheckCircle2 className="h-3.5 w-3.5" /> Present on Campus
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-[#E63946]/15 text-[#E63946] text-xs font-bold px-3 py-1 rounded-full border border-[#E63946]/30">
                <XCircle className="h-3.5 w-3.5" /> Absent Today
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
          {/* Step 1: Attendance Toggle */}
          <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-4 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Step 1: College Attendance
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                className={`flex-1 font-semibold text-xs h-10 ${
                  isPresent
                    ? "bg-[#10B981] hover:bg-[#059669] text-white shadow-xs"
                    : "bg-white text-muted-foreground border hover:bg-slate-50"
                }`}
                onClick={() => handleMarkAttendance("present")}
              >
                <UserCheck className="h-4 w-4 mr-1.5" /> I am Present
              </Button>
              <Button
                type="button"
                variant="outline"
                className={`font-semibold text-xs h-10 ${
                  !isPresent
                    ? "bg-[#E63946]/10 text-[#E63946] border-[#E63946]/40"
                    : "text-muted-foreground"
                }`}
                onClick={() => handleMarkAttendance("absent")}
              >
                <XCircle className="h-4 w-4 mr-1.5" /> Absent
              </Button>
            </div>
          </div>

          {/* Step 2: Food Choice (Canteen vs Tiffin) */}
          <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-4 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Step 2: Meal Preference
            </div>
            {isPresent ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  className={`flex-1 font-semibold text-xs h-10 ${
                    choice === "canteen"
                      ? "bg-[#FF6B35] text-white hover:bg-[#e85a26] shadow-xs"
                      : "bg-white text-muted-foreground border hover:bg-slate-50"
                  }`}
                  onClick={() => handleFoodChoice("canteen")}
                >
                  <Utensils className="h-4 w-4 mr-1.5" /> Canteen Food
                </Button>
                <Button
                  type="button"
                  className={`flex-1 font-semibold text-xs h-10 ${
                    choice === "tiffin"
                      ? "bg-[#004E64] text-white hover:bg-[#003B4C] shadow-xs"
                      : "bg-white text-muted-foreground border hover:bg-slate-50"
                  }`}
                  onClick={() => handleFoodChoice("tiffin")}
                >
                  <Briefcase className="h-4 w-4 mr-1.5" /> Brought Tiffin
                </Button>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic h-10 flex items-center">
                Mark yourself present to choose meal preference.
              </div>
            )}
          </div>
        </div>

        {/* Live Status Note */}
        {studentRec && (
          <div className="text-xs text-muted-foreground bg-[#F8F9FA] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 border border-slate-200">
            <div>
              Student: <strong>{studentRec.name}</strong> ({studentRec.rollNo} · {studentRec.branch})
            </div>
            <div>
              Current Recorded Choice:{" "}
              <strong>
                {studentRec.attendance === "absent"
                  ? "Absent (Not Eating)"
                  : studentRec.foodChoice === "canteen"
                  ? "🍽️ Eating Canteen Food"
                  : "🍱 Brought Tiffin (Home Food)"}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Key Student Metrics */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Branch / Year" value={`${p?.branch ?? "—"} · ${p?.academic_year ?? "—"}`} />
        <Stat label="Lunch Slot" value={slot ? `${slot.start_time.slice(0, 5)}–${slot.end_time.slice(0, 5)}` : "12:30–13:15"} />
        <Stat
          label="Cafeteria Free Seats"
          value={seat?.updated_at ? Math.max(0, seat.total_seats - seat.occupied_seats) : "34"}
          hint={seat?.updated_at ? `Updated ${new Date(seat.updated_at).toLocaleTimeString()}` : "Live Seating Sensor"}
        />
        <Stat label="Dishes Ready" value={d.data?.menu.filter((m) => m.is_available).length ?? "12"} />
      </div>

      {/* Main Student Food Ordering & Kiosk Section (70% White/Off-White, 20% Vibrant Orange CTAs, 10% Deep Teal headers) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FF6B35] text-white shadow-sm">
                <Utensils className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-bold font-display text-[#1A202C]">
                Canteen Food Menu & Order Kiosk
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Select dishes, customize portions, and order ahead to skip cafeteria queues.
            </p>
          </div>

          {/* Active Cart Quick Summary Button (#FF6B35) */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                className="bg-[#FF6B35] hover:bg-[#e85a26] text-white font-bold px-4 py-2 text-sm shadow-md flex items-center gap-2"
                onClick={handleCheckoutOrder}
                disabled={totalCartCount === 0}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Order Now (₹{totalCartPrice})</span>
                {totalCartCount > 0 && (
                  <span className="bg-white text-[#FF6B35] text-xs font-black px-2 py-0.5 rounded-full shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Kiosk Category Tabs: Deep Teal (#004E64) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? "bg-[#004E64] text-white shadow-sm"
                    : "bg-[#F8F9FA] text-[#1A202C] hover:bg-slate-200 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Crisp White Food Cards Grid (White cards on Off-White section) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMenu.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-3 py-8 text-center">
              No dishes found in this category.
            </p>
          )}

          {filteredMenu.map((m) => {
            const inCart = cart[m.id];
            const isVeg = !m.name.toLowerCase().includes("chicken") && !m.name.toLowerCase().includes("egg");

            return (
              <div
                key={m.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {/* Veg Badge: Emerald Green (#10B981) */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            isVeg ? "bg-[#10B981]" : "bg-[#E63946]"
                          }`}
                          title={isVeg ? "Vegetarian" : "Non-Veg"}
                        />
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">
                          {m.category || "Main"}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-[#1A202C] mt-0.5">{m.name}</h3>
                    </div>

                    {/* Semantic Status: Emerald Green for Ready / Soft Coral for Out of Stock */}
                    {m.is_available ? (
                      <span className="text-[11px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md border border-[#10B981]/20">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#E63946] bg-[#E63946]/10 px-2 py-0.5 rounded-md border border-[#E63946]/20">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Freshly prepared in campus kitchen. Served piping hot during lunch slots.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="font-display text-xl font-bold text-[#1A202C]">
                    ₹{m.price}
                  </div>

                  {m.is_available ? (
                    inCart ? (
                      <div className="flex items-center gap-1.5 bg-[#FF6B35]/10 rounded-xl p-1 border border-[#FF6B35]/30">
                        <button
                          type="button"
                          onClick={() => removeFromCart(m.id)}
                          className="h-7 w-7 rounded-lg bg-white text-[#FF6B35] font-bold flex items-center justify-center hover:bg-slate-100 transition-colors shadow-xs"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-bold text-sm text-[#FF6B35] px-2">
                          {inCart.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(m)}
                          className="h-7 w-7 rounded-lg bg-[#FF6B35] text-white font-bold flex items-center justify-center hover:bg-[#e85a26] transition-colors shadow-xs"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => addToCart(m)}
                        className="bg-[#FF6B35] hover:bg-[#e85a26] text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Order Now
                      </Button>
                    )
                  ) : (
                    <Button
                      size="sm"
                      disabled
                      variant="outline"
                      className="text-xs h-9 px-3 text-[#E63946] border-[#E63946]/30 bg-[#E63946]/5"
                    >
                      Out of Stock
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Campus Announcements */}
      <Section title="Canteen Announcements">
        {d.data?.ann.length === 0 && <p className="text-sm text-muted-foreground">No active announcements.</p>}
        {d.data?.ann.map((a) => (
          <div key={a.id} className="border-b py-2.5">
            <div className="font-semibold text-sm text-[#1A202C]">{a.title}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{a.body}</p>
          </div>
        ))}
      </Section>
    </div>
  );
}

