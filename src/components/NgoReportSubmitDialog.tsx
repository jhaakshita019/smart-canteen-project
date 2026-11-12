import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addSevaReport, type NgoPartner } from "@/lib/ngo-data";
import { UploadCloud, Trash2, HeartHandshake, CheckCircle2 } from "lucide-react";

interface NgoReportSubmitDialogProps {
  ngo: NgoPartner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportAdded?: () => void;
}

export function NgoReportSubmitDialog({
  ngo,
  open,
  onOpenChange,
  onReportAdded,
}: NgoReportSubmitDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    reportDate: new Date().toISOString().slice(0, 10),
    mealsServed: "",
    beneficiariesCount: "",
    location: "",
    volunteerCount: "",
    foodType: "",
    highlights: "",
    imageUrl: "",
    submittedBy: "",
  });
  const [submitting, setSubmitting] = useState(false);

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
    try {
      const dataUrl = await compressImage(file);
      setForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      toast.success("Seva photo ready");
    } catch {
      toast.error("Failed to load photo");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ngo) {
      toast.error("No NGO selected");
      return;
    }
    if (!form.title.trim() || !form.mealsServed) {
      toast.error("Please provide title and meals served count");
      return;
    }

    setSubmitting(true);
    try {
      addSevaReport({
        ngoId: ngo.id,
        ngoName: ngo.name,
        reportTitle: form.title.trim(),
        reportDate: form.reportDate,
        mealsServed: Number(form.mealsServed) || 0,
        beneficiariesCount: Number(form.beneficiariesCount) || Number(form.mealsServed) || 0,
        location: form.location.trim() || ngo.serviceArea,
        volunteerCount: Number(form.volunteerCount) || 1,
        foodType: form.foodType.trim() || "Canteen Surplus Meals",
        highlights: form.highlights.trim() || "Meals distributed with dignity to local families in need.",
        imageUrl: form.imageUrl || undefined,
        submittedBy: form.submittedBy.trim() || `${ngo.name} Coordinator`,
      });

      toast.success("Seva & Impact Report published! Visible to Canteen & Admin dashboards.");
      onOpenChange(false);
      setForm({
        title: "",
        reportDate: new Date().toISOString().slice(0, 10),
        mealsServed: "",
        beneficiariesCount: "",
        location: "",
        volunteerCount: "",
        foodType: "",
        highlights: "",
        imageUrl: "",
        submittedBy: "",
      });
      onReportAdded?.();
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-ngo font-semibold text-xs uppercase tracking-wider">
            <HeartHandshake className="h-4 w-4" /> Official Seva Report
          </div>
          <DialogTitle className="text-xl">Submit Seva & Impact Report</DialogTitle>
          <DialogDescription>
            Report meals served and community impact by <strong>{ngo?.name || "your NGO"}</strong>.
            This report will be visible to Canteen Staff, College Administration, and in your partner profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold">Report / Drive Title *</Label>
              <Input
                required
                className="mt-1"
                placeholder="e.g. Campus Surplus Distribution & Slum Seva Drive"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Date of Seva *</Label>
              <Input
                type="date"
                required
                className="mt-1"
                value={form.reportDate}
                onChange={(e) => setForm({ ...form, reportDate: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Total Meals Served (Seva Count) *</Label>
              <Input
                type="number"
                min={1}
                required
                className="mt-1"
                placeholder="e.g. 250"
                value={form.mealsServed}
                onChange={(e) => setForm({ ...form, mealsServed: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Beneficiaries / People Reached</Label>
              <Input
                type="number"
                min={0}
                className="mt-1"
                placeholder="e.g. 230"
                value={form.beneficiariesCount}
                onChange={(e) => setForm({ ...form, beneficiariesCount: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Active Volunteers on Duty</Label>
              <Input
                type="number"
                min={1}
                className="mt-1"
                placeholder="e.g. 6"
                value={form.volunteerCount}
                onChange={(e) => setForm({ ...form, volunteerCount: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Distribution Location</Label>
              <Input
                className="mt-1"
                placeholder="e.g. North Gate Labor Colony / Train Station"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Food Type Distributed</Label>
              <Input
                className="mt-1"
                placeholder="e.g. Canteen Surplus Thali + Khichdi"
                value={form.foodType}
                onChange={(e) => setForm({ ...form, foodType: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold">Your Name & Role</Label>
              <Input
                className="mt-1"
                placeholder="e.g. Rahul Sharma (Field Operations Lead)"
                value={form.submittedBy}
                onChange={(e) => setForm({ ...form, submittedBy: e.target.value })}
              />
            </div>
          </div>

          {/* Photo Proof */}
          <div>
            <Label className="text-xs font-semibold">Seva Photo / Proof of Distribution</Label>
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
              <div className="mt-2 relative rounded-xl border bg-muted/40 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={form.imageUrl} alt="Seva Preview" className="h-16 w-24 object-cover rounded-md border" />
                  <span className="text-xs text-muted-foreground font-medium">Photo attached</span>
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
                className="mt-1.5 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-ngo/60 hover:bg-ngo/5 transition-colors"
              >
                <UploadCloud className="h-6 w-6 text-ngo mb-1" />
                <span className="text-xs font-medium text-foreground">Click to upload photo of food distribution</span>
                <span className="text-[10px] text-muted-foreground">JPG, PNG (Auto-compressed)</span>
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold">Seva Highlights & Observations</Label>
            <Textarea
              className="mt-1"
              rows={3}
              placeholder="Describe how the distribution went, any community feedback, or special moments during the seva..."
              value={form.highlights}
              onChange={(e) => setForm({ ...form, highlights: e.target.value })}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-ngo text-ngo-foreground hover:bg-ngo/90" disabled={submitting}>
              {submitting ? "Submitting Report..." : "Publish Official Seva Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
