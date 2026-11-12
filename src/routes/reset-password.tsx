import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset password — Smart Canteen" },
    { name: "description", content: "Choose a new password for your Smart Canteen account." },
    { property: "og:title", content: "Reset password — Smart Canteen" },
    { property: "og:description", content: "Choose a new password for your Smart Canteen account." },
  ] }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form className="w-full max-w-sm space-y-3" onSubmit={async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.updateUser({ password: pw });
        if (error) { toast.error(error.message); return; }
        toast.success("Password updated");
        navigate({ to: "/" });
      }}>
        <h1 className="text-3xl font-bold">Set a new password</h1>
        <Input type="password" minLength={8} required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" />
        <Button className="w-full" type="submit">Update password</Button>
      </form>
    </div>
  );
}
