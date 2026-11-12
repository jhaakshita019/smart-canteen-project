import { useState, useEffect } from "react";
import {
  getSurplusListings,
  requestPickup,
  getPickupRequests,
  type SurplusFoodListing,
  type PickupRequest,
} from "@/lib/surplus-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Utensils,
  Clock,
  MapPin,
  CheckCircle2,
  PackageCheck,
  Building,
  Truck,
  HeartHandshake,
} from "lucide-react";

interface NgoSurplusClaimSectionProps {
  ngoName: string;
  ngoId: string;
  ngoContact?: string;
  isVerified: boolean;
}

export function NgoSurplusClaimSection({
  ngoName,
  ngoId,
  ngoContact = "+91 98201 12345",
  isVerified,
}: NgoSurplusClaimSectionProps) {
  const [listings, setListings] = useState<SurplusFoodListing[]>([]);
  const [myRequests, setMyRequests] = useState<PickupRequest[]>([]);

  // Selected listing for pickup modal / form
  const [activePickupId, setActivePickupId] = useState<string | null>(null);
  const [requestedPlates, setRequestedPlates] = useState<number>(0);
  const [volunteerNote, setVolunteerNote] = useState<string>("");
  const [confirmTransport, setConfirmTransport] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  function reload() {
    setListings(getSurplusListings());
    const reqs = getPickupRequests();
    setMyRequests(reqs.filter((r) => r.ngoId === ngoId || r.ngoName.includes(ngoName)));
  }

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    window.addEventListener("smart_canteen_surplus_updated", handleUpdate);
    return () => window.removeEventListener("smart_canteen_surplus_updated", handleUpdate);
  }, [ngoId, ngoName]);

  const openListings = listings.filter((l) => l.status === "open");

  async function handleConfirmPickup(listing: SurplusFoodListing) {
    if (!isVerified) {
      toast.error("Only college-verified NGO partners can request food pickup.");
      return;
    }
    const count = requestedPlates > 0 ? requestedPlates : listing.platesCount;
    if (count <= 0 || count > listing.platesCount) {
      toast.error(`Please request between 1 and ${listing.platesCount} plates.`);
      return;
    }

    setSubmitting(true);
    try {
      requestPickup({
        listingId: listing.id,
        foodName: listing.foodName,
        platesRequested: count,
        totalPlates: listing.platesCount,
        ngoId,
        ngoName,
        ngoContact,
        note: volunteerNote.trim() || "Volunteer pickup van dispatched.",
      });

      toast.success(
        `Pickup requested for ${count} plates! Canteen staff has received an instant notification with your contact.`
      );
      setActivePickupId(null);
      setRequestedPlates(0);
      setVolunteerNote("");
      reload();
    } catch {
      toast.error("Failed to submit pickup request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-ngo text-ngo-foreground">
              <Truck className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold font-display">
              Surplus Food Available for NGO Pickup
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Live leftovers from <strong>Engineering College Main Canteen</strong>. Check remaining plate counts, photos, and request immediate pickup.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl font-semibold w-fit">
          <Building className="h-3.5 w-3.5" /> Engineering College Campus Canteen
        </div>
      </div>

      {!isVerified && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-800 dark:text-amber-300">
          ⚠️ <strong>Account Verification Pending:</strong> Your NGO profile is currently under review by College Administration. Once approved, you can claim surplus plates and dispatch pickup vans.
        </div>
      )}

      {/* Available Surplus Cards Grid */}
      {openListings.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No surplus food listings open right now. Canteen staff posts extra food after lunch & dinner preparation batches.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {openListings.map((l) => {
            const isSelected = activePickupId === l.id;

            return (
              <div
                key={l.id}
                className="rounded-2xl border bg-card overflow-hidden shadow-xs hover:border-ngo/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {l.imageUrl && (
                    <div className="relative h-40 bg-muted">
                      <img
                        src={l.imageUrl}
                        alt={l.foodName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-ngo text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Utensils className="h-3 w-3" /> {l.platesCount} {l.unit} left
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-base leading-snug text-foreground">
                      {l.foodName}
                    </h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-ngo shrink-0" />
                      <span>
                        Safe until:{" "}
                        <strong>
                          {new Date(l.availableUntil).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </strong>
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{l.canteenLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  {isSelected ? (
                    <div className="space-y-3 pt-3 border-t">
                      <div>
                        <Label className="text-xs font-semibold">How many plates do you need?</Label>
                        <Input
                          type="number"
                          min={1}
                          max={l.platesCount}
                          className="mt-1 h-8 text-xs"
                          defaultValue={l.platesCount}
                          onChange={(e) => setRequestedPlates(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold">Pickup Note (Volunteer / ETA)</Label>
                        <Input
                          className="mt-1 h-8 text-xs"
                          placeholder="e.g., Van arriving in 15 mins"
                          value={volunteerNote}
                          onChange={(e) => setVolunteerNote(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-8"
                          onClick={() => setActivePickupId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-ngo text-ngo-foreground hover:bg-ngo/90 font-semibold text-xs h-8"
                          disabled={submitting}
                          onClick={() => handleConfirmPickup(l)}
                        >
                          {submitting ? "Sending..." : "✓ Confirm Pickup"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full bg-ngo text-ngo-foreground hover:bg-ngo/90 font-semibold text-xs h-9"
                      disabled={!isVerified}
                      onClick={() => {
                        setActivePickupId(l.id);
                        setRequestedPlates(l.platesCount);
                      }}
                    >
                      <Truck className="h-3.5 w-3.5 mr-1.5" /> Request Food Pickup ({l.platesCount} Plates)
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active My Pickup Requests Status */}
      {myRequests.length > 0 && (
        <div className="pt-4 border-t space-y-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <PackageCheck className="h-4 w-4 text-green-600" /> My Active Food Pickup Requests ({myRequests.length})
          </h3>
          <div className="space-y-2">
            {myRequests.map((r) => {
              const statusBadge =
                r.status === "approved"
                  ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300"
                  : r.status === "picked_up"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";

              return (
                <div
                  key={r.id}
                  className="rounded-xl border bg-muted/20 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-sm text-foreground">
                      {r.foodName} ({r.platesRequested} Plates)
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                      Requested at: {new Date(r.requestedAt).toLocaleTimeString()} • Canteen notified immediately
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${statusBadge}`}>
                      {r.status === "requested" ? "Canteen Notified / Pending" : r.status === "approved" ? "Pickup Approved by Canteen" : "Handover Completed"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
