import { useState, useEffect } from "react";
import { Download, Smartphone, Laptop, Check, Share2, PlusSquare, X, QrCode, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    // Current URL for sharing
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.origin);
    }

    // Check if running as standalone PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Detect mobile device
    const userAgent = navigator.userAgent || "";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobileDevice(isMobile);

    // Detect iOS
    const ios = /iPhone|iPad|iPod/i.test(userAgent);
    setIsIos(ios);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    } else if (!isMobileDevice) {
      setShowQrModal(true);
    } else {
      alert("Apne mobile browser me menu (⋮ ya Share) open karein aur 'Add to Home Screen' / 'Install App' select karein.");
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard && currentUrl) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success("Mobile link copied! Apne phone me WhatsApp ya Browser me paste karein.");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (dismissed || isStandalone) {
    return null;
  }

  const qrImageUrl = currentUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=004e64&bgcolor=ffffff&data=${encodeURIComponent(currentUrl)}`
    : "";

  return (
    <>
      <div className="bg-gradient-to-r from-[#004E64] to-[#003645] text-white border-b border-[#002B36] px-4 py-2.5 shadow-sm text-xs sm:text-sm">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-md bg-[#FF6B35] text-white shrink-0">
              {isMobileDevice ? <Smartphone className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white">Smart Canteen</span>
                <span className="text-white/80">— Campus Food App</span>
                <span className="bg-[#FF6B35]/20 text-[#FF9E79] border border-[#FF6B35]/40 text-[10px] px-2 py-0.2 rounded-full font-bold">
                  {isMobileDevice ? "Mobile Web & PWA" : "Laptop & Desktop Ready"}
                </span>
              </div>
              <p className="text-[11px] text-white/80 hidden sm:block">
                {isMobileDevice
                  ? "Install on your phone home screen for fast 1-tap food orders & live token alerts."
                  : "Scan QR code with your phone camera or copy link to run on your mobile!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {!isMobileDevice && (
              <button
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold px-3 py-1.5 text-xs border border-white/20 transition-all cursor-pointer"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Open on Phone / QR</span>
              </button>
            )}

            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF6B35] hover:bg-[#e85a26] text-white font-bold px-3 py-1.5 text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isMobileDevice ? "Install Mobile App" : "Add App Shortcut"}</span>
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showIosGuide && (
          <div className="mt-2.5 p-3 rounded-lg bg-black/40 border border-white/20 text-xs text-white/95 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <p className="font-bold text-[#FFB703]">iPhone / iPad par install karne ke 3 simple steps:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-white/90">
                <li>Safari me neeche <Share2 className="inline h-3.5 w-3.5 mx-0.5 text-[#38BDF8]" /> Share button par tap karein.</li>
                <li>Scroll karke <PlusSquare className="inline h-3.5 w-3.5 mx-0.5 text-green-400" /> "Add to Home Screen" select karein.</li>
                <li>Top-right me "Add" par tap karein. App aapke phone me install ho jayegi!</li>
              </ol>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-white border-white/30 hover:bg-white/20 h-7 text-xs shrink-0"
              onClick={() => setShowIosGuide(false)}
            >
              Got it
            </Button>
          </div>
        )}
      </div>

      {/* QR Code & Mobile Launch Modal for Laptop Users */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute right-3.5 top-3.5 p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#004E64]/10 text-[#004E64]">
              <Smartphone className="h-6 w-6" />
            </div>

            <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-white">
              Phone me Open & Install karein
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Apne mobile phone ke camera se neeche diya gaya QR code scan karein:
            </p>

            {qrImageUrl && (
              <div className="mx-auto my-4 w-fit rounded-xl border-2 border-dashed border-[#004E64]/30 bg-white p-3 shadow-inner">
                <img
                  src={qrImageUrl}
                  alt="Scan to open on phone"
                  className="h-44 w-44 rounded-lg object-contain"
                />
              </div>
            )}

            <div className="space-y-2 text-left bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border text-xs">
              <div className="font-bold text-[#004E64] dark:text-[#38BDF8] flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" />
                <span>Mobile App Kaise Banayein:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300">
                <li><strong>Chrome Browser me Login</strong>: Google security ke karan phone me wahi Google ID se Chrome open karein jisse aap AI Studio use kar rahe hain (taaki 403 error na aaye).</li>
                <li><strong>Android Chrome</strong>: Website open karke 3 dots (⋮) par tap karein → <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong>.</li>
                <li><strong>iPhone Safari</strong>: Share (↑) par tap karein → <strong>"Add to Home Screen"</strong>.</li>
              </ul>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleCopyLink}
                className="flex-1 bg-[#004E64] hover:bg-[#003B4C] text-white text-xs h-9 font-semibold"
              >
                {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                {copied ? "Link Copied!" : "Copy Mobile Link"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowQrModal(false)}
                className="text-xs h-9"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileBottomNavigation() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#004E64] text-white border-t border-[#003847] shadow-xl pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 text-center py-2">
        <a
          href="/"
          className="flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-white/80 hover:text-[#FF6B35] transition-colors"
        >
          <img src="/app-logo.png" alt="Home" className="h-5 w-5 rounded-md object-contain" />
          <span>Home</span>
        </a>

        <a
          href="/student/login"
          className="flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-[#FF6B35]"
        >
          <div className="p-1 rounded-full bg-[#FF6B35] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <span>Order</span>
        </a>

        <a
          href="/canteen/login"
          className="flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-white/80 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 7h10" />
            <path d="M7 12h10" />
            <path d="M7 17h10" />
          </svg>
          <span>Kitchen</span>
        </a>

        <a
          href="/ngo/login"
          className="flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-green-300 hover:text-green-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <span>NGO Claim</span>
        </a>
      </div>
    </nav>
  );
}
