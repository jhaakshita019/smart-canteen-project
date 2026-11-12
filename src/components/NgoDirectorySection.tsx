import { useState, useEffect } from "react";
import {
  getNgoPartners,
  getNgoSevaReports,
  updateNgoVerification,
  type NgoPartner,
} from "@/lib/ngo-data";
import { NgoProfileDialog } from "./NgoProfileDialog";
import { NgoReportSubmitDialog } from "./NgoReportSubmitDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  FileText,
  Search,
  HeartHandshake,
  ExternalLink,
  PlusCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface NgoDirectorySectionProps {
  currentRole?: "canteen" | "admin" | "ngo";
  currentNgoId?: string;
  title?: string;
  subtitle?: string;
  canVerify?: boolean;
}

export function NgoDirectorySection({
  currentRole = "canteen",
  currentNgoId,
  title = "Verified NGO Partners & Seva Impact Directory",
  subtitle = "Complete list of 10 registered NGOs receiving surplus campus food and their verified seva impact reports.",
  canVerify = false,
}: NgoDirectorySectionProps) {
  const [ngos, setNgos] = useState<NgoPartner[]>([]);
  const [search, setSearch] = useState("");
  const [activeNgo, setActiveNgo] = useState<NgoPartner | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportSubmitOpen, setReportSubmitOpen] = useState(false);
  const [reportingNgo, setReportingNgo] = useState<NgoPartner | null>(null);

  function reload() {
    setNgos(getNgoPartners());
  }

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    window.addEventListener("smart_canteen_reports_updated", handleUpdate);
    return () => window.removeEventListener("smart_canteen_reports_updated", handleUpdate);
  }, []);

  const filtered = ngos.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.name.toLowerCase().includes(q) ||
      n.serviceArea.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q)
    );
  });

  const totalAllMeals = ngos.reduce(
    (sum, n) => sum + n.stats.totalMealsServed + getNgoSevaReports(n.id).reduce((s, r) => s + r.mealsServed, 0),
    0
  );
  const totalAllDrives = ngos.reduce(
    (sum, n) => sum + n.stats.foodDrives + getNgoSevaReports(n.id).length,
    0
  );

  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header and Summary stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-ngo/10 text-ngo">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display">{title}</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border bg-muted/40 px-3.5 py-1.5 text-right">
            <div className="text-xs text-muted-foreground uppercase font-semibold">Total NGO Seva</div>
            <div className="text-lg font-bold text-ngo font-display">
              {totalAllMeals.toLocaleString()} meals
            </div>
          </div>
          <div className="rounded-xl border bg-muted/40 px-3.5 py-1.5 text-right">
            <div className="text-xs text-muted-foreground uppercase font-semibold">Food Drives</div>
            <div className="text-lg font-bold text-primary font-display">{totalAllDrives} drives</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by NGO name, area..."
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <strong>{filtered.length}</strong> of <strong>{ngos.length}</strong> NGO Partners
        </div>
      </div>

      {/* 10 NGO Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filtered.map((ngo) => {
          const reports = getNgoSevaReports(ngo.id);
          const totalReportMeals = reports.reduce((s, r) => s + r.mealsServed, 0);
          const grandMeals = ngo.stats.totalMealsServed + totalReportMeals;
          const latestReport = reports[0];

          return (
            <div
              key={ngo.id}
              className="rounded-xl border bg-card p-4 transition-all hover:border-ngo/40 hover:shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-base text-foreground leading-snug">{ngo.name}</h3>
                      {ngo.verificationStatus === "verified" ? (
                        <span className="inline-flex items-center gap-0.5 text-green-700 bg-green-100 dark:bg-green-950/60 dark:text-green-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> Under Review
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground italic mt-0.5 line-clamp-1">
                      "{ngo.tagline}"
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  {ngo.description}
                </p>

                {/* Seva Counter Highlights */}
                <div className="grid grid-cols-3 gap-2 my-3 rounded-lg bg-muted/40 p-2.5 text-center">
                  <div>
                    <div className="text-sm font-bold text-ngo font-display">
                      {grandMeals.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Meals Served</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground font-display">
                      {ngo.stats.foodDrives + reports.length}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Food Drives</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-green-600 dark:text-green-400 font-display">
                      {ngo.stats.surplusPortionsCollected}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Canteen Saved</div>
                  </div>
                </div>

                {/* Location and Contact */}
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{ngo.serviceArea}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{ngo.contact}</span>
                  </div>
                </div>

                {/* Latest Seva Report Info Badge */}
                {latestReport && (
                  <div className="mt-2 text-[11px] bg-ngo/5 border border-ngo/20 rounded-md p-1.5 text-foreground flex items-center justify-between">
                    <span className="truncate">
                      📄 <strong>Latest Seva:</strong> {latestReport.reportTitle} ({latestReport.mealsServed} meals)
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-1">
                      {latestReport.reportDate}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 flex-1"
                  onClick={() => {
                    setActiveNgo(ngo);
                    setDialogOpen(true);
                  }}
                >
                  <FileText className="h-3.5 w-3.5 mr-1 text-primary" /> View Profile & Seva Report ({reports.length})
                </Button>

                {/* Button to add report if this is NGO portal or authorized */}
                {(currentRole === "ngo" || currentRole === "admin") && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs h-8"
                    onClick={() => {
                      setReportingNgo(ngo);
                      setReportSubmitOpen(true);
                    }}
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add Seva Report
                  </Button>
                )}

                {/* Admin quick verify toggle */}
                {canVerify && (
                  <div className="flex gap-1">
                    {ngo.verificationStatus !== "verified" ? (
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          updateNgoVerification(ngo.id, "verified");
                          reload();
                          toast.success(`${ngo.name} marked as Verified!`);
                        }}
                      >
                        Verify
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-muted-foreground"
                        onClick={() => {
                          updateNgoVerification(ngo.id, "pending");
                          reload();
                          toast.info(`${ngo.name} set to Pending verification`);
                        }}
                      >
                        Unverify
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog for View Profile & Seva Reports */}
      <NgoProfileDialog
        ngo={activeNgo}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {/* Modal Dialog to submit a new Seva Report */}
      <NgoReportSubmitDialog
        ngo={reportingNgo}
        open={reportSubmitOpen}
        onOpenChange={setReportSubmitOpen}
        onReportAdded={() => reload()}
      />
    </div>
  );
}
