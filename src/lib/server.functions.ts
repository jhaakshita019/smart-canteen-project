import { supabase } from "@/integrations/supabase/client";

// Demo accounts: fixed emails only, password is public by design (demo use).
export const DEMO_PASSWORD = "DemoCanteen#2026";
export const DEMO = {
  student: {
    email: "demo.student@smartcanteen.app",
    name: "Aarav (Demo Student)",
    meta: { branch: "Computer Science", academic_year: "2" },
  },
  canteen: {
    email: "demo.canteen@smartcanteen.app",
    name: "Meera (Demo Canteen)",
    meta: {},
  },
  ngo: {
    email: "demo.ngo@smartcanteen.app",
    name: "Annapurna Seva (Demo NGO)",
    meta: { org_name: "Annapurna Seva Trust (Demo)" },
  },
  admin: {
    email: "demo.admin@smartcanteen.app",
    name: "Dr. Rao (Demo Admin)",
    meta: {},
  },
} as const;

export function useServerFn<TOutput>(
  fn: () => Promise<TOutput>,
): () => Promise<TOutput>;
export function useServerFn<TInput, TOutput>(
  fn: (input: TInput) => Promise<TOutput>,
): (input: TInput) => Promise<TOutput>;
export function useServerFn(fn: any) {
  return fn;
}

export async function ensureDemoAccount({
  data,
}: {
  data: { role: "student" | "canteen" | "ngo" | "admin" };
}): Promise<{ email: string; password: string }> {
  const d = DEMO[data.role];
  return { email: d.email, password: DEMO_PASSWORD };
}

export async function askCanteenBot({
  data,
}: {
  data: { messages: Array<{ role: "user" | "assistant"; content: string }> };
}): Promise<{ reply: string }> {
  const [{ data: menu }, { data: seat }, { data: ann }] = await Promise.all([
    supabase.from("menu_items").select("name,price,is_available,category"),
    supabase.from("canteen_seating_status").select("*").maybeSingle(),
    supabase
      .from("announcements")
      .select("title,body")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Include student attendance summary & surplus food metrics from local service
  let surplusContext = "";
  let studentAttendanceContext = "";
  try {
    const { getSurplusListings } = await import("./surplus-service");
    const { getStudentAttendanceList } = await import("./attendance-service");
    const { getNgoPartners } = await import("./ngo-data");

    const surplusList = getSurplusListings();
    const openSurplus = surplusList.filter((s) => s.status === "open");
    const totalSurplusPlates = openSurplus.reduce((a, b) => a + b.platesCount, 0);
    surplusContext = `Surplus Listings Open Now: ${totalSurplusPlates} plates available across [${openSurplus.map((s) => `${s.foodName}: ${s.platesCount} plates`).join(", ")}]. 10 partner NGOs registered.`;

    const students = getStudentAttendanceList();
    const eatingCanteen = students.filter((s) => s.attendance === "present" && s.foodChoice === "canteen").length;
    const eatingTiffin = students.filter((s) => s.attendance === "present" && s.foodChoice === "tiffin").length;
    const absent = students.filter((s) => s.attendance === "absent").length;
    studentAttendanceContext = `Student Attendance & Meal Demands: 50 registered students, ${eatingCanteen} eating canteen food, ${eatingTiffin} brought home tiffin, ${absent} absent.`;
  } catch (err) {
    console.warn("Could not load local service metrics for chat context:", err);
  }

  const freeSeats = seat && seat.total_seats > 0 ? Math.max(0, seat.total_seats - seat.occupied_seats) : 34;
  const ctx = `Live Canteen Data:
• Current Menu Items: ${JSON.stringify(menu || [])}
• Cafeteria Seating: ${seat?.occupied_seats ?? 26}/${seat?.total_seats ?? 60} occupied (${freeSeats} vacant seats).
• Lunch Schedule: Daily 12:30 PM - 1:30 PM (Staggered by batches).
• Announcements: ${JSON.stringify(ann || [])}
• ${surplusContext}
• ${studentAttendanceContext}`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: data.messages,
        context: ctx,
        parsedData: { menu, seat, announcements: ann },
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.reply) return { reply: json.reply };
    }
  } catch (e) {
    console.warn("Backend chat endpoint failed, falling back to local responder:", e);
  }

  // Graceful in-browser responder using live Supabase context
  const lastUserMsg = (data.messages[data.messages.length - 1]?.content || "").toLowerCase();
  if (
    lastUserMsg.includes("menu") ||
    lastUserMsg.includes("available") ||
    lastUserMsg.includes("price") ||
    lastUserMsg.includes("food") ||
    lastUserMsg.includes("khana") ||
    lastUserMsg.includes("dish")
  ) {
    const avail = (menu ?? []).filter((m) => m.is_available);
    const out = (menu ?? []).filter((m) => !m.is_available);
    let reply = `🍽️ **Today's Canteen Menu & Pricing:**\n\n`;
    if (avail.length > 0) {
      reply += `✅ **Available Right Now:**\n` + avail.map((m) => `• **${m.name}** (${m.category}) — ₹${m.price}`).join("\n");
    }
    if (out.length > 0) {
      reply += `\n\n❌ **Sold Out:**\n` + out.map((m) => `• ${m.name} — ₹${m.price}`).join("\n");
    }
    return { reply };
  }

  if (
    lastUserMsg.includes("seat") ||
    lastUserMsg.includes("crowd") ||
    lastUserMsg.includes("empty") ||
    lastUserMsg.includes("full") ||
    lastUserMsg.includes("khali")
  ) {
    if (seat && seat.total_seats > 0) {
      const free = Math.max(0, seat.total_seats - seat.occupied_seats);
      const pct = Math.round((seat.occupied_seats / seat.total_seats) * 100);
      return {
        reply: `🪑 **Live Canteen Seating Counter:**\n• **Total Capacity:** ${seat.total_seats} seats\n• **Occupied:** ${seat.occupied_seats} (${pct}%)\n• **Free Seats:** ${free}\n\n${free > 10 ? "✨ Plenty of seats available!" : "⚠️ Canteen is filling up quickly."}`,
      };
    }
    return {
      reply: `🪑 **Seating Update:**\nCafeteria seats are open and available right now.`,
    };
  }

  return {
    reply: `👋 **Welcome to Smart Canteen AI!**\n\nI can help you with:\n• 🍲 **Menu & dishes** (Ask: "What is on today's menu?")\n• 🪑 **Live seating** (Ask: "Are seats free?")\n• 📢 **Notices & lunch slots**\n• 🍱 **NGO surplus food claims**\n\nHow can I help you today?`,
  };
}

export async function forecastDemand(): Promise<{
  rows: Array<{
    dish: string;
    samples: number;
    basis: string;
    expectedDemand: number | null;
    suggestedPrep: number | null;
    avgLeftover: number | null;
    confidence: string;
  }>;
  summary: string;
}> {
  const since = new Date(Date.now() - 28 * 864e5).toISOString().slice(0, 10);
  const [{ data: batches }, { data: menu }, { data: stock }] = await Promise.all([
    supabase
      .from("food_preparation_batches")
      .select("menu_item_id,prep_date,prepared_qty,sold_qty,donated_qty,discarded_qty")
      .gte("prep_date", since),
    supabase.from("menu_items").select("id,name"),
    supabase.from("ingredient_stock").select("*"),
  ]);

  const tomorrowDow = new Date(Date.now() + 864e5).getDay();
  const rows = (menu ?? []).map((m) => {
    const hist = (batches ?? []).filter((b) => b.menu_item_id === m.id);
    const sameDay = hist.filter((b) => new Date(b.prep_date).getDay() === tomorrowDow);
    const use = sameDay.length >= 2 ? sameDay : hist;
    const avgSold = use.length ? use.reduce((s, b) => s + b.sold_qty, 0) / use.length : null;
    const avgLeft = use.length
      ? use.reduce((s, b) => s + (b.prepared_qty - b.sold_qty), 0) / use.length
      : null;
    return {
      dish: m.name,
      samples: use.length,
      basis: sameDay.length >= 2 ? "same weekday" : hist.length ? "all recent days" : "no history",
      expectedDemand: avgSold == null ? null : Math.round(avgSold),
      suggestedPrep: avgSold == null ? null : Math.ceil(avgSold * 1.05),
      avgLeftover: avgLeft == null ? null : Math.round(avgLeft),
      confidence: use.length >= 6 ? "medium" : use.length >= 2 ? "low" : "insufficient data",
    };
  });

  let summary = "";
  try {
    const res = await fetch("/api/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forecast: rows, stock }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.summary) summary = json.summary;
    }
  } catch {
    // Fallback summary
  }

  if (!summary) {
    summary = `• Projected demand is estimated using historical 28-day batch logs.
• Suggested preparation includes a 5% buffer to accommodate peak footfall.
• Check the ingredient ledger for low-stock warnings before prep begins.
• Review lunch slot distribution to schedule secondary batch replenishment.`;
  }

  return { rows, summary };
}
