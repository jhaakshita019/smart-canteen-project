import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    let hasUser = !!data.user;
    if (!hasUser && typeof window !== "undefined") {
      const demoRole = localStorage.getItem("smart_canteen_demo_role");
      if (demoRole) hasUser = true;
    }
    if (!hasUser) {
      const portal = location.pathname.split("/")[1] || "student";
      throw redirect({ to: "/$portal/login", params: { portal } });
    }
  },
  component: () => <Outlet />,
});
