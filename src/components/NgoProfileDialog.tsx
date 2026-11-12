import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  type NgoPartner,
  type SevaReport,
  getNgoSevaReports,
} from "@/lib/ngo-data";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Utensils,
  Phone,
  Mail,
  Calendar,
  FileText,
  HeartHandshake,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

interface NgoProfileDialogProps {
  ngo: NgoPartner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NgoProfileDialog({ ngo, open, onOpenChange }: NgoProfileDialogProps) {
  const qc = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<"posts" | "reports">("posts");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const postsQuery = useQuery({
    queryKey: ["ngo_profile_posts", ngo?.id],
    queryFn: async () => {
      if (!ngo?.id) return [];
      const { data } = await supabase
        .from("ngo_posts")
        .select("*")
        .order("created_at", { ascending: false });
      // Return posts matching this NGO's user_id or all if demo
      return (data ?? []).filter(
        (p) => p.ngo_id === ngo.id || ngo.id === "332a18ed-e0de-4a87-9fd4-65fc75c3cb72"
      );
    },
    enabled: !!ngo?.id && open,
  });

  if (!ngo) return null;

  const reports = getNgoSevaReports(ngo.id);
  const totalReportedMeals = reports.reduce((acc, r) => acc + r.mealsServed, 0);
  const totalBeneficiaries = reports.reduce((acc, r) => acc + r.beneficiariesCount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-ngo via-ngo/90 to-primary p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
                  NGO Partner Profile & Seva Log
                </span>
                {ngo.verificationStatus === "verified" ? (
                  <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold">
                    <CheckCircle2 className="h-3 w-3 text-green-300" /> Verified Partner
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-yellow-400/30 text-yellow-100 px-2 py-0.5 rounded-full text-[11px] font-bold">
                    <Clock className="h-3 w-3" /> Under Verification
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold mt-1 text-white">{ngo.name}</h2>
              <p className="text-sm opacity-90 mt-0.5 italic">"{ngo.tagline}"</p>
            </div>
            <div className="text-right sm:border-l sm:border-white/20 sm:pl-4">
              <div className="text-xs opacity-75">Active Since</div>
              <div className="font-bold text-lg">{ngo.establishedYear}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs opacity-90 pt-3 border-t border-white/20">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {ngo.serviceArea}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> {ngo.contact}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {ngo.email}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Cumulative Seva KPI Highlights */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-3 flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4 text-ngo" /> Cumulative Seva Impact
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border bg-muted/40 p-3.5 text-center">
                <div className="text-2xl font-black text-ngo font-display">
                  {(ngo.stats.totalMealsServed + totalReportedMeals).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">Total Meals Served</div>
              </div>
              <div className="rounded-xl border bg-muted/40 p-3.5 text-center">
                <div className="text-2xl font-black text-primary font-display">
                  {ngo.stats.foodDrives + reports.length}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">Food Drives Done</div>
              </div>
              <div className="rounded-xl border bg-muted/40 p-3.5 text-center">
                <div className="text-2xl font-black text-green-600 dark:text-green-400 font-display">
                  {ngo.stats.surplusPortionsCollected.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">Canteen Surplus Saved</div>
              </div>
              <div className="rounded-xl border bg-muted/40 p-3.5 text-center">
                <div className="text-2xl font-black text-foreground font-display">
                  {ngo.stats.activeVolunteers}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">Seva Volunteers</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-muted/20 rounded-xl p-4 border text-sm text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">About the Organization: </span>
            {ngo.description}
          </div>

          {/* Tab Navigation: Activity Posts vs Seva Reports */}
          <div className="flex border-b gap-3">
            <button
              onClick={() => setSelectedTab("posts")}
              className={`pb-2.5 text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
                selectedTab === "posts"
                  ? "border-ngo text-ngo"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Camera className="h-4 w-4" /> Activity Posts & Photos ({postsQuery.data?.length ?? 0})
            </button>
            <button
              onClick={() => setSelectedTab("reports")}
              className={`pb-2.5 text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
                selectedTab === "reports"
                  ? "border-ngo text-ngo"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4" /> Verified Seva Reports ({reports.length})
            </button>
          </div>

          {/* Tab 1: NGO Activity Posts */}
          {selectedTab === "posts" && (
            <div className="space-y-4">
              {postsQuery.isLoading && (
                <div className="text-center py-6 text-sm text-muted-foreground">Loading NGO posts...</div>
              )}
              {!postsQuery.isLoading && (postsQuery.data ?? []).length === 0 && (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  No activity posts shared yet by <strong>{ngo.name}</strong>.
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {(postsQuery.data ?? []).map((p) => {
                  const hasCaption = p.body?.startsWith("Caption: ");
                  const captionText = hasCaption ? p.body.split("\n\n")[0]?.replace("Caption: ", "") : null;
                  const detailText = hasCaption ? p.body.split("\n\n").slice(1).join("\n\n") : p.body;

                  const statusColor =
                    p.status === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300"
                      : p.status === "rejected"
                      ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300";

                  return (
                    <div key={p.id} className="rounded-xl border bg-card overflow-hidden shadow-xs flex flex-col justify-between">
                      <div>
                        {p.image_url && (
                          <div className="relative h-36 bg-muted">
                            <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                            {captionText && (
                              <div className="absolute bottom-0 inset-x-0 bg-black/70 px-3 py-1.5 text-[11px] text-white">
                                📷 <em>"{captionText}"</em>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="p-3.5 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm leading-snug line-clamp-1">{p.title}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${statusColor}`}>
                              {p.status}
                            </span>
                          </div>
                          {detailText && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{detailText}</p>
                          )}
                        </div>
                      </div>

                      <div className="p-3.5 pt-0">
                        <div className="flex items-center justify-between gap-2 pt-2 border-t">
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
                          {confirmDeleteId === p.id ? (
                            <div className="flex items-center gap-1 shrink-0 animate-in fade-in duration-150">
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={deletingId === p.id}
                                className="h-6 text-[11px] px-2 font-bold bg-red-600 hover:bg-red-700 text-white"
                                onClick={async () => {
                                  setDeletingId(p.id);
                                  const { error } = await supabase.from("ngo_posts").delete().eq("id", p.id);
                                  setDeletingId(null);
                                  setConfirmDeleteId(null);
                                  if (error) {
                                    toast.error(error.message || "Failed to delete post");
                                  } else {
                                    toast.success("Post deleted");
                                    postsQuery.refetch();
                                    qc.invalidateQueries({ queryKey: ["public-posts"] });
                                    qc.invalidateQueries({ queryKey: ["admin"] });
                                    qc.invalidateQueries({ queryKey: ["ngo"] });
                                  }
                                }}
                              >
                                {deletingId === p.id ? "..." : "Confirm"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[11px] px-1.5"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive px-1.5 shrink-0"
                              onClick={() => setConfirmDeleteId(p.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" /> Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Verified Seva Reports */}
          {selectedTab === "reports" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                  <FileText className="h-4 w-4 text-primary" /> Verified Seva & Impact Reports ({reports.length})
                </h3>
                <span className="text-xs text-muted-foreground">
                  Visible to Canteen Staff & College Administration
                </span>
              </div>

              {reports.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No reports submitted yet by this NGO partner.
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-xl border bg-card p-4 transition-all hover:shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5">
                        <div>
                          <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                            {report.reportTitle}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="inline-flex items-center gap-1 font-medium text-foreground">
                              <Calendar className="h-3.5 w-3.5 text-primary" /> {report.reportDate}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {report.location}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" /> {report.volunteerCount} Volunteers
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:text-right">
                          <div className="bg-ngo/10 text-ngo px-3 py-1 rounded-lg">
                            <div className="text-lg font-bold font-display leading-tight">
                              {report.mealsServed}
                            </div>
                            <div className="text-[10px] font-semibold uppercase">Meals Served</div>
                          </div>
                        </div>
                      </div>

                      {/* Report Highlights and Photo */}
                      <div className="flex flex-col md:flex-row gap-4 items-start">
                        {report.imageUrl && (
                          <img
                            src={report.imageUrl}
                            alt={report.reportTitle}
                            className="h-28 w-full md:w-44 rounded-lg object-cover border shrink-0"
                            loading="lazy"
                          />
                        )}
                        <div className="space-y-2 flex-1 text-sm">
                          <p className="text-muted-foreground leading-relaxed">{report.highlights}</p>
                          {report.foodType && (
                            <div className="text-xs bg-muted/50 rounded-md p-2 flex items-center gap-2 text-foreground">
                              <Utensils className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span>
                                <strong>Food Distributed:</strong> {report.foodType}
                              </span>
                            </div>
                          )}
                          <div className="text-[11px] text-muted-foreground">
                            Report filed by: <strong>{report.submittedBy}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
