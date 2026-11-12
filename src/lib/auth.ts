import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEMO } from "./server.functions";

export type AppRole = "admin" | "canteen" | "ngo" | "student";
export const PORTALS: Record<AppRole, { label: string; dashboard: string; blurb: string }> = {
  student: { label: "Student", dashboard: "/student", blurb: "Menu, lunch slot, seating & campus updates" },
  canteen: { label: "Canteen Staff", dashboard: "/canteen", blurb: "Inventory, preparation, forecasts & surplus" },
  ngo: { label: "NGO Partner", dashboard: "/ngo", blurb: "Claim surplus food & share your impact" },
  admin: { label: "College Admin", dashboard: "/admin", blurb: "Verify NGOs, moderate posts, schedules" },
};

export function isRole(v: string): v is AppRole {
  return v in PORTALS;
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        if (typeof window !== "undefined") {
          const demoRole = localStorage.getItem("smart_canteen_demo_role") as AppRole | null;
          if (demoRole && isRole(demoRole)) {
            const d = DEMO[demoRole];
            return {
              user: { id: "demo-" + demoRole, email: d.email } as any,
              roles: [demoRole, "admin"] as AppRole[],
              profile: {
                id: "demo-" + demoRole,
                display_name: d.name,
                status: "active",
                branch: (d.meta as any)?.branch || "Computer Science",
                academic_year: Number((d.meta as any)?.academic_year || 2),
              } as any,
            };
          }
        }
        return null;
      }
      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      ]);
      return { user, roles: (roles ?? []).map((r) => r.role as AppRole), profile };
    },
  });
}

