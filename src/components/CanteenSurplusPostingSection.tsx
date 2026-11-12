import { useState, useRef, useEffect } from "react";
import {
  getSurplusListings,
  createSurplusListing,
  deleteSurplusListing,
  getPickupRequests,
  updatePickupStatus,
  type SurplusFoodListing,
  type PickupRequest,
} from "@/lib/surplus-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Utensils,
  UploadCloud,
  Trash2,
  Bell,
  Clock,
  CheckCircle2,
  PackageCheck,
  AlertTriangle,
  Building,
} from "lucide-react";

export function CanteenSurplusPostingSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listings, setListings] = useState<SurplusFoodListing[]>([]);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);

  const [form, setForm] = useState({
    foodName: "",
    platesCount: "",
    category: "Full Meal",
    availableHours: "3",
    imageUrl: "",
    canteenLocation: "Engineering College Main Canteen, Block A Counter 2",
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function reload() {
    setListings(getSurplusListings());
    setPickupRequests(getPickupRequests());
  }

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    const handleNewRequest = (e: any) => {
      reload();
      const req = e.detail as PickupRequest;
      toast.info(
        `🚨 New Pickup Request! ${req.ngoName} requested ${req.platesRequested} plates of ${req.foodName}!`,
        { duration: 8000 }
      );
    };

    window.addEventListener("smart_canteen_surplus_updated", handleUpdate);
    window.addEventListener("smart_canteen_new_pickup_request", handleNewRequest);
    return () => {
      window.removeEventListener("smart_canteen_surplus_updated", handleUpdate);
      window.removeEventListener("smart_canteen_new_pickup_request", handleNewRequest);
    };
  }, []);

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const maxDim = 900;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG/JPG)");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      setForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      toast.success("Food photo attached");
    } catch {
      toast.error("Failed to load photo");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.foodName.trim() || !form.platesCount) {
      toast.error("Please enter food item and number of plates");
      return;
    }

    setSubmitting(true);
    try {
      const hours = Number(form.availableHours) || 3;
      const availableUntil = new Date(Date.now() + hours * 3600000).toISOString();

      createSurplusListing({
        foodName: form.foodName.trim(),
        category: form.category,
        platesCount: Number(form.platesCount) || 10,
        unit: "plates",
        imageUrl:
          form.imageUrl ||
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
        preparedAt: new Date().toISOString(),
        availableUntil,
        canteenLocation: form.canteenLocation,
      });

      toast.success(
        `Surplus listing posted! ${form.platesCount} plates of ${form.foodName} are now visible to verified NGOs for pickup.`
      );
      setForm({
        foodName: "",
        platesCount: "",
        category: "Full Meal",
        availableHours: "3",
        imageUrl: "",
        canteenLocation: "Engineering College Main Canteen, Block A Counter 2",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      reload();
    } catch {
      toast.error("Failed to post surplus listing");
    } finally {
      setSubmitting(false);
    }
  }

  const pendingRequests = pickupRequests.filter((r) => r.status === "requested");
  const approvedRequests = pickupRequests.filter((r) => r.status === "approved");

  return (
    <div className="space-y-6">
      {/* Real-time Pickup Alert Banner */}
      {pendingRequests.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-500/50 bg-amber-500/10 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <h3 className="font-bold text-base text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Bell className="h-4 w-4" /> Live NGO Pickup Requests ({pendingRequests.length} Pending)
              </h3>
            </div>
            <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
              Needs Canteen Action
            </span>
          </div>

          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-zinc-800 rounded-xl p-3.5 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span>{req.ngoName}</span>
                    <span className="bg-ngo/10 text-ngo text-[11px] px-2 py-0.2 rounded-md font-semibold">
                      {req.platesRequested} Plates
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Item: <strong>{req.foodName}</strong> • Requested at:{" "}
                    {new Date(req.requestedAt).toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Contact: <strong>{req.ngoContact}</strong> {req.note && `• Note: "${req.note}"`}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs h-8"
                    onClick={() => {
                      updatePickupStatus(req.id, "approved");
                      toast.success(`Approved pickup for ${req.ngoName}!`);
                      reload();
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve Pickup
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Posting Form Card */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                <Utensils className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-bold font-display">
                Post Surplus / Leftover Food for NGOs
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Engineering College Canteen Authority: Post surplus dishes and plate counts with photos so verified NGOs can immediately request pickup.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-xl font-medium w-fit">
            <Building className="h-3.5 w-3.5" /> Engineering College Canteen
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold">Leftover Food Description *</Label>
              <Input
                required
                className="mt-1"
                placeholder="e.g. Deluxe Veg Thali (Dal Makhani, Mix Veg, Jeera Rice & 4 Chapatis)"
                value={form.foodName}
                onChange={(e) => setForm({ ...form, foodName: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Number of Plates Left *</Label>
              <Input
                type="number"
                min={1}
                required
                className="mt-1"
                placeholder="e.g. 50"
                value={form.platesCount}
                onChange={(e) => setForm({ ...form, platesCount: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Meal Category</Label>
              <select
                className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Full Meal / Thali</option>
                <option>Rice & Curry Dish</option>
                <option>Snacks / Tiffin</option>
                <option>Rotis & Chapatis</option>
                <option>Dessert / Halwa</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Safe Consumption Window</Label>
              <select
                className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={form.availableHours}
                onChange={(e) => setForm({ ...form, availableHours: e.target.value })}
              >
                <option value="2">2 Hours from now</option>
                <option value="3">3 Hours from now (Standard)</option>
                <option value="4">4 Hours from now</option>
                <option value="6">6 Hours from now (Dinner)</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Canteen Pickup Location</Label>
              <Input
                className="mt-1"
                value={form.canteenLocation}
                onChange={(e) => setForm({ ...form, canteenLocation: e.target.value })}
              />
            </div>
          </div>

          {/* Food Photo Upload */}
          <div>
            <Label className="text-xs font-semibold">Food Photo (Actual picture of leftover food)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            {form.imageUrl ? (
              <div className="mt-2 relative rounded-xl border bg-muted/30 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={form.imageUrl}
                    alt="Leftover Food Preview"
                    className="h-20 w-28 object-cover rounded-lg border shadow-xs"
                  />
                  <div>
                    <div className="text-sm font-semibold text-foreground">Food Photo Attached</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Ready to publish with plates count
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-colors"
              >
                <UploadCloud className="h-6 w-6 text-primary mb-1" />
                <span className="text-xs font-semibold text-foreground">
                  {uploading ? "Processing photo..." : "Click to upload photo of leftover food"}
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  Allows NGOs to see food quality and hygiene before sending pickup van
                </span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-semibold"
            disabled={submitting || uploading}
          >
            {submitting ? "Posting surplus listing..." : "Publish Surplus Food Listing for Verified NGOs"}
          </Button>
        </form>

        {/* Active Open Surplus Listings */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">
              Current Open Listings ({listings.filter((l) => l.status === "open").length})
            </h3>
            <span className="text-xs text-muted-foreground">Visible on NGO Dashboard</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <div
                key={l.id}
                className="rounded-xl border bg-card overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  {l.imageUrl && (
                    <div className="relative h-32 bg-muted">
                      <img src={l.imageUrl} alt={l.foodName} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                        {l.platesCount} {l.unit} left
                      </div>
                    </div>
                  )}
                  <div className="p-3 space-y-1.5">
                    <h4 className="font-bold text-sm leading-snug line-clamp-2">{l.foodName}</h4>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Pickup until:{" "}
                      {new Date(l.availableUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      📍 {l.canteenLocation}
                    </div>
                  </div>
                </div>

                <div className="p-3 pt-0 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-green-700 bg-green-100 dark:bg-green-950/60 dark:text-green-300 px-2 py-0.5 rounded text-center flex-1">
                    {l.status === "open" ? "Available for NGO Pickup" : "Claimed"}
                  </div>
                  {deletingId === l.id ? (
                    <div className="flex items-center gap-1.5 shrink-0 animate-in fade-in duration-150">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs px-2.5 font-bold shadow-xs bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => {
                          deleteSurplusListing(l.id);
                          toast.success(`Deleted surplus food listing: "${l.foodName}"`);
                          setDeletingId(null);
                          reload();
                        }}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2"
                        onClick={() => setDeletingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive px-2 shrink-0"
                      onClick={() => setDeletingId(l.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Approved and Completed Pickups Log */}
        {approvedRequests.length > 0 && (
          <div className="pt-4 border-t space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <PackageCheck className="h-4 w-4 text-green-600" /> Confirmed NGO Pickups in Progress ({approvedRequests.length})
            </h3>
            <div className="space-y-2">
              {approvedRequests.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border bg-muted/20 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-foreground">{r.ngoName}</span> —{" "}
                    <strong>{r.platesRequested} plates</strong> of {r.foodName}
                    <div className="text-muted-foreground">
                      Driver/Volunteer Contact: <strong>{r.ngoContact}</strong>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs bg-card"
                    onClick={() => {
                      updatePickupStatus(r.id, "picked_up");
                      toast.success(`Handover confirmed to ${r.ngoName}!`);
                      reload();
                    }}
                  >
                    Confirm Food Handed Over
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
