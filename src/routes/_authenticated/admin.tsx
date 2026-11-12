import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, Section } from "@/components/AppShell";
import { NgoDirectorySection } from "@/components/NgoDirectorySection";
import { NgoProfileDialog } from "@/components/NgoProfileDialog";
import { getNgoPartners, type NgoPartner } from "@/lib/ngo-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Smart Canteen" }, { name: "description", content: "Verify NGOs, moderate posts, schedules." }, { property: "og:title", content: "Admin Dashboard" }, { property: "og:description", content: "Verify NGOs, moderate posts, schedules." }] }),
  component: () => <AppShell role="admin"><Admin /></AppShell>,
});

function Admin() {
  const qc = useQueryClient();
  const d = useQuery({
    queryKey: ["admin"],
    queryFn: async () => {
      const [ngos, posts, staff, sched] = await Promise.all([
        supabase.from("ngo_profiles").select("*").order("created_at"),
        supabase.from("ngo_posts").select("*, ngo_profiles(org_name)").eq("status", "pending"),
        supabase.from("profiles").select("*").eq("status", "pending"),
        supabase.from("lunch_break_schedules").select("*").order("day_of_week"),
      ]);
      return { ngos: ngos.data ?? [], posts: posts.data ?? [], staff: staff.data ?? [], sched: sched.data ?? [] };
    },
  });
  const r = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const [s, setS] = useState({ branch: "Computer Science", year: "1", day: String(new Date().getDay()), start: "12:30", end: "13:15" });
  const [visitedNgo, setVisitedNgo] = useState<NgoPartner | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function openNgoProfile(n: any) {
    const all = getNgoPartners();
    const found = all.find((x) => x.id === n.user_id) || {
      id: n.user_id,
      name: n.org_name,
      tagline: n.description || "Community Welfare Partner",
      description: n.description || "Verified college welfare partner providing hot meal distribution.",
      contact: n.contact || "+91 98201 12345",
      email: "partner@smartcanteen.app",
      serviceArea: n.service_area || "Campus + 5 km radius",
      verificationStatus: n.verification_status,
      establishedYear: 2019,
      stats: { totalMealsServed: 12500, foodDrives: 64, surplusPortionsCollected: 1850, activeVolunteers: 20 },
      sampleReports: [],
    };
    setVisitedNgo(found);
    setProfileOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* 10 NGO Partners & Seva Reports Review */}
      <NgoDirectorySection
        currentRole="admin"
        canVerify={true}
        title="Registered NGO Partners & Verified Seva Reports (10 NGOs)"
        subtitle="College Administration: Review how many meals and drives each NGO has completed, verify partner status, and inspect detailed seva reports with photo proof."
      />

      <div className="grid gap-6 lg:grid-cols-2">
      <Section title="NGO verification">
        {d.data?.ngos.map((n) => (
          <div key={n.user_id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b py-2 text-sm gap-2">
            <div>
              <span className="font-semibold text-foreground">{n.org_name}</span>{" "}
              <span className="text-xs text-muted-foreground uppercase font-bold px-1.5 py-0.5 rounded bg-muted">
                {n.verification_status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-primary"
                onClick={() => openNgoProfile(n)}
              >
                <FileText className="h-3 w-3 mr-1" /> Visit Profile & Posts
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                onClick={async () => {
                  await supabase.from("ngo_profiles").update({ verification_status: "verified" }).eq("user_id", n.user_id);
                  r();
                  toast.success(`${n.org_name} verified!`);
                }}
              >
                Verify
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-destructive hover:bg-destructive/10"
                onClick={async () => {
                  await supabase.from("ngo_profiles").update({ verification_status: "rejected" }).eq("user_id", n.user_id);
                  r();
                  toast.info(`${n.org_name} rejected`);
                }}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </Section>
      <Section title="Posts awaiting moderation">
        {d.data?.posts.length === 0 && <p className="text-sm text-muted-foreground">Nothing pending.</p>}
        {d.data?.posts.map((p) => {
          const hasCaption = p.body?.startsWith("Caption: ");
          const captionText = hasCaption ? p.body.split("\n\n")[0]?.replace("Caption: ", "") : null;
          const detailText = hasCaption
            ? p.body.split("\n\n").slice(1).join("\n\n")
            : p.body;

          return (
            <div key={p.id} className="border-b py-3 text-sm space-y-2">
              <div className="flex flex-col sm:flex-row gap-3">
                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="h-24 w-32 rounded-lg object-cover border shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base">{p.title}</div>
                  <div className="text-xs text-ngo font-medium mt-0.5">By: {p.ngo_profiles?.org_name}</div>
                  {captionText && (
                    <div className="text-xs italic text-muted-foreground mt-1">📷 Caption: {captionText}</div>
                  )}
                  {detailText && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{detailText}</p>}
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {[p.location && `📍 ${p.location}`, p.beneficiaries != null && `👥 ${p.beneficiaries} people reached`].filter(Boolean).join(" • ")}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <Button size="sm" onClick={async () => { await supabase.from("ngo_posts").update({ status: "approved" }).eq("id", p.id); r(); }}>Approve & Publish</Button>
                <Button size="sm" variant="outline" onClick={async () => { await supabase.from("ngo_posts").update({ status: "rejected" }).eq("id", p.id); r(); }}>Reject</Button>
                {confirmDeleteId === p.id ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deletingPostId === p.id}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold h-8 text-xs"
                      onClick={async () => {
                        setDeletingPostId(p.id);
                        const { error } = await supabase.from("ngo_posts").delete().eq("id", p.id);
                        setDeletingPostId(null);
                        setConfirmDeleteId(null);
                        if (error) toast.error(error.message);
                        else {
                          toast.success("Post deleted permanently");
                          r();
                          qc.invalidateQueries({ queryKey: ["public-posts"] });
                        }
                      }}
                    >
                      {deletingPostId === p.id ? "Deleting..." : "Confirm Delete"}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 text-xs"
                    onClick={() => setConfirmDeleteId(p.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </Section>
      <Section title="Pending canteen staff">
        {d.data?.staff.length === 0 && <p className="text-sm text-muted-foreground">No pending accounts.</p>}
        {d.data?.staff.map((p) => <div key={p.id} className="flex justify-between border-b py-2 text-sm"><span>{p.display_name}</span><Button size="sm" onClick={async () => { await supabase.from("profiles").update({ status: "active" }).eq("id", p.id); r(); }}>Activate</Button></div>)}
      </Section>
      <Section title="Lunch break timetable">
        <form className="grid grid-cols-5 gap-2" onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.from("lunch_break_schedules").insert({ branch: s.branch, academic_year: Number(s.year), day_of_week: Number(s.day), start_time: s.start, end_time: s.end });
          if (error) toast.error(error.message); else { toast.success("Saved"); r(); }
        }}>
          <select className="col-span-2 rounded-md border bg-background px-2 text-sm" value={s.branch} onChange={(e) => setS({ ...s, branch: e.target.value })}>{["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical", "IT"].map((b) => <option key={b}>{b}</option>)}</select>
          <Input type="number" min={1} max={6} value={s.year} onChange={(e) => setS({ ...s, year: e.target.value })} />
          <select className="rounded-md border bg-background px-2 text-sm" value={s.day} onChange={(e) => setS({ ...s, day: e.target.value })}>{days.map((x, i) => <option key={x} value={i}>{x}</option>)}</select>
          <Button type="submit">Add</Button>
          <Input type="time" className="col-span-2" value={s.start} onChange={(e) => setS({ ...s, start: e.target.value })} />
          <Input type="time" className="col-span-2" value={s.end} onChange={(e) => setS({ ...s, end: e.target.value })} />
        </form>
        <div className="mt-3">{d.data?.sched.map((x) => <div key={x.id} className="border-b py-1 text-sm">{days[x.day_of_week]} · {x.branch} Y{x.academic_year} · {x.start_time.slice(0, 5)}–{x.end_time.slice(0, 5)}</div>)}</div>
      </Section>
    </div>

    {/* Admin NGO Profile & Activity Posts Visitor Modal */}
    <NgoProfileDialog
      ngo={visitedNgo}
      open={profileOpen}
      onOpenChange={setProfileOpen}
    />
    </div>
  );
}
