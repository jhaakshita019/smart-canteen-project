import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UploadCloud, Image as ImageIcon, X, Trash2, MapPin, Users, Calendar, AlertCircle, HeartHandshake, PlusCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, Section, Stat } from "@/components/AppShell";
import { useMe } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NgoSurplusClaimSection } from "@/components/NgoSurplusClaimSection";
import { NgoReportSubmitDialog } from "@/components/NgoReportSubmitDialog";
import { NgoProfileDialog } from "@/components/NgoProfileDialog";
import { getNgoPartners, type NgoPartner } from "@/lib/ngo-data";

export const Route = createFileRoute("/_authenticated/ngo")({
  head: () => ({
    meta: [
      { title: "NGO Dashboard — Smart Canteen" },
      { name: "description", content: "Claim surplus food and share impact." },
      { property: "og:title", content: "NGO Dashboard" },
      { property: "og:description", content: "Claim surplus food and share impact." },
    ],
  }),
  component: () => (
    <AppShell role="ngo">
      <Ngo />
    </AppShell>
  ),
});

function compressImage(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

function Ngo() {
  const me = useMe();
  const uid = me.data?.user.id;
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const d = useQuery({
    queryKey: ["ngo", uid],
    enabled: !!uid,
    queryFn: async () => {
      const [prof, list, reqs, posts] = await Promise.all([
        supabase.from("ngo_profiles").select("*").eq("user_id", uid!).maybeSingle(),
        supabase
          .from("surplus_food_listings")
          .select("*")
          .eq("status", "open")
          .order("created_at", { ascending: false }),
        supabase
          .from("donation_requests")
          .select("*, surplus_food_listings(description,quantity,unit)")
          .eq("ngo_id", uid!),
        supabase.from("ngo_posts").select("*").eq("ngo_id", uid!).order("created_at", { ascending: false }),
      ]);
      return { prof: prof.data, list: list.data ?? [], reqs: reqs.data ?? [], posts: posts.data ?? [] };
    },
  });

  const [post, setPost] = useState({
    title: "",
    caption: "",
    body: "",
    image_url: "",
    location: "",
    beneficiaries: "",
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(null);

  const verified = d.data?.prof?.verification_status === "verified";
  const refresh = () => qc.invalidateQueries({ queryKey: ["ngo", uid] });

  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Please select an image under 10MB");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      setPost((prev) => ({ ...prev, image_url: dataUrl }));
      toast.success("Image uploaded and ready");
    } catch {
      toast.error("Failed to process image");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  }

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const allPartners = getNgoPartners();
  const currentPartner =
    allPartners.find((n) => n.id === uid) ||
    allPartners.find((n) => n.id === "332a18ed-e0de-4a87-9fd4-65fc75c3cb72") ||
    allPartners[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Organisation" value={d.data?.prof?.org_name ?? "—"} />
        <Stat
          label="Verification"
          value={
            <span className={verified ? "text-success" : "text-warning"}>
              {d.data?.prof?.verification_status ?? "—"}
            </span>
          }
        />
        <Stat label="Requests made" value={d.data?.reqs.length ?? 0} />
      </div>

      {/* Official Seva & Impact Reporting Action Card */}
      <div className="rounded-2xl border-2 border-ngo/30 bg-gradient-to-r from-ngo/5 via-card to-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-ngo text-white">
                <HeartHandshake className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-bold font-display text-foreground">
                Official Seva & Impact Reporting
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Report your field distribution and seva numbers. Once submitted, your verified meal counts, location, and photos are immediately visible to <strong>Canteen Staff</strong> and <strong>College Administration</strong>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              className="bg-ngo text-ngo-foreground hover:bg-ngo/90 font-semibold"
              onClick={() => setReportModalOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1.5" /> Submit Seva Report
            </Button>
            <Button
              variant="outline"
              onClick={() => setProfileModalOpen(true)}
            >
              <FileText className="h-4 w-4 mr-1.5 text-ngo" /> View My Seva Log & Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Engineering College Canteen Surplus Food Claim & Pickup */}
      <NgoSurplusClaimSection
        ngoName={d.data?.prof?.org_name || currentPartner.name}
        ngoId={uid || currentPartner.id}
        ngoContact={d.data?.prof?.contact || currentPartner.contact}
        isVerified={verified}
      />

      <Section title="Share an activity post">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!post.title.trim()) {
              toast.error("Please enter a title");
              return;
            }
            setSubmitting(true);

            // Combine caption and body cleanly for storage
            const combinedBody = post.caption?.trim()
              ? post.body?.trim()
                ? `Caption: ${post.caption.trim()}\n\n${post.body.trim()}`
                : `Caption: ${post.caption.trim()}`
              : post.body.trim();

            const { error } = await supabase.from("ngo_posts").insert({
              ngo_id: uid!,
              title: post.title.trim(),
              body: combinedBody,
              image_url: post.image_url || null,
              location: post.location.trim() || null,
              beneficiaries: post.beneficiaries ? Number(post.beneficiaries) : null,
              activity_date: new Date().toISOString().slice(0, 10),
            });

            setSubmitting(false);
            if (error) {
              toast.error(error.message);
            } else {
              toast.success("Post submitted for admin moderation!");
              setPost({ title: "", caption: "", body: "", image_url: "", location: "", beneficiaries: "" });
              if (fileInputRef.current) fileInputRef.current.value = "";
              refresh();
            }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-semibold">Activity Title *</Label>
              <Input
                required
                className="mt-1"
                placeholder="e.g., Evening Food Relief at Community Center"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Location</Label>
              <Input
                className="mt-1"
                placeholder="e.g., Campus East Gate / Block 4"
                value={post.location}
                onChange={(e) => setPost({ ...post, location: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">People Reached (Beneficiaries)</Label>
              <Input
                type="number"
                min={0}
                className="mt-1"
                placeholder="e.g., 65"
                value={post.beneficiaries}
                onChange={(e) => setPost({ ...post, beneficiaries: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Photo Caption</Label>
              <Input
                className="mt-1"
                placeholder="e.g., Volunteers distributing warm thali meals"
                value={post.caption}
                onChange={(e) => setPost({ ...post, caption: e.target.value })}
              />
            </div>
          </div>

          {/* Image Upload Area */}
          <div>
            <Label className="text-xs font-semibold">Activity Photo</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {post.image_url ? (
              <div className="mt-2 relative rounded-xl border bg-muted/30 p-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <img
                    src={post.image_url}
                    alt="Upload preview"
                    className="h-28 w-40 rounded-lg object-cover border shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {post.caption ? post.caption : "Selected photo"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Photo compressed & ready to upload.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change photo
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setPost((prev) => ({ ...prev, image_url: "" }));
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 p-6 text-center hover:border-ngo/60 hover:bg-ngo/5 cursor-pointer transition-colors"
              >
                <div className="rounded-full bg-ngo/10 p-3 text-ngo">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="mt-2 text-sm font-semibold">
                  {uploading ? "Processing image..." : "Click or drag & drop to upload activity photo"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PNG, JPG, WebP (auto-optimized). Please ensure no identifiable children without consent.
                </p>
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold">Detailed Description / Story</Label>
            <Textarea
              className="mt-1"
              rows={3}
              placeholder="What food was distributed, who was assisted, and how did it go?"
              value={post.body}
              onChange={(e) => setPost({ ...post, body: e.target.value })}
            />
          </div>

          <Button
            className="w-full bg-ngo text-ngo-foreground hover:bg-ngo/90 font-semibold"
            type="submit"
            disabled={submitting || uploading}
          >
            {submitting ? "Submitting post..." : "Submit Activity Post for Moderation"}
          </Button>
        </form>

        {/* Existing posts listing with thumbnail & status */}
        <div className="mt-8 border-t pt-5">
          <h3 className="font-semibold text-base mb-3">My Activity Posts ({d.data?.posts.length ?? 0})</h3>
          {d.data?.posts.length === 0 && (
            <p className="text-sm text-muted-foreground">No posts shared yet.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {d.data?.posts.map((p) => {
              const hasCaption = p.body?.startsWith("Caption: ");
              const captionText = hasCaption ? p.body.split("\n\n")[0]?.replace("Caption: ", "") : null;
              const detailText = hasCaption
                ? p.body.split("\n\n").slice(1).join("\n\n")
                : p.body;

              const statusColor =
                p.status === "approved"
                  ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300"
                  : p.status === "rejected"
                  ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300";

              return (
                <div key={p.id} className="rounded-xl border bg-card overflow-hidden shadow-xs">
                  {p.image_url && (
                    <div className="relative h-36 bg-muted">
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                      {captionText && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 px-3 py-1 text-[11px] text-white truncate">
                          📷 {captionText}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm leading-snug line-clamp-1">{p.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${statusColor}`}>
                        {p.status}
                      </span>
                    </div>

                    {detailText && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{detailText}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t mt-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        {p.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {p.location}
                          </span>
                        )}
                        {p.beneficiaries != null && (
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3" /> {p.beneficiaries} fed
                          </span>
                        )}
                        {p.activity_date && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {p.activity_date}
                          </span>
                        )}
                      </div>
                      {confirmDeletePostId === p.id ? (
                        <div className="flex items-center gap-1.5 shrink-0 animate-in fade-in duration-150">
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deletingPostId === p.id}
                            className="h-7 text-xs px-2.5 font-bold shadow-xs bg-red-600 hover:bg-red-700 text-white"
                            onClick={async () => {
                              setDeletingPostId(p.id);
                              try {
                                const { error } = await supabase.from("ngo_posts").delete().eq("id", p.id);
                                if (error) {
                                  toast.error(error.message || "Failed to delete post");
                                } else {
                                  toast.success(`Post "${p.title}" deleted successfully`);
                                  qc.invalidateQueries({ queryKey: ["ngo", uid] });
                                  qc.invalidateQueries({ queryKey: ["public-posts"] });
                                }
                              } catch (err: any) {
                                toast.error(err?.message || "Failed to delete post");
                              } finally {
                                setDeletingPostId(null);
                                setConfirmDeletePostId(null);
                              }
                            }}
                          >
                            {deletingPostId === p.id ? "Deleting..." : "Confirm Delete"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2"
                            onClick={() => setConfirmDeletePostId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive px-2 shrink-0"
                          onClick={() => setConfirmDeletePostId(p.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Seva Report Dialog */}
      <NgoReportSubmitDialog
        ngo={currentPartner}
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        onReportAdded={() => refresh()}
      />

      {/* Profile & Seva Log Dialog */}
      <NgoProfileDialog
        ngo={currentPartner}
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
      />
    </div>
  );
}

