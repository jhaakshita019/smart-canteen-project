export interface SurplusFoodListing {
  id: string;
  foodName: string;
  category: string;
  platesCount: number;
  unit: string;
  imageUrl?: string;
  preparedAt: string;
  availableUntil: string;
  canteenLocation: string;
  status: "open" | "claimed" | "completed";
  createdAt: string;
}

export interface PickupRequest {
  id: string;
  listingId: string;
  foodName: string;
  platesRequested: number;
  totalPlates: number;
  ngoId: string;
  ngoName: string;
  ngoContact: string;
  status: "requested" | "approved" | "picked_up";
  note?: string;
  requestedAt: string;
  approvedAt?: string;
  pickedUpAt?: string;
}

const STORAGE_SURPLUS_KEY = "smart_canteen_surplus_listings_v3";
const STORAGE_PICKUP_KEY = "smart_canteen_pickup_requests_v3";

const INITIAL_SURPLUS_LISTINGS: SurplusFoodListing[] = [
  {
    id: "surplus-1",
    foodName: "Deluxe Veg Lunch Thali (Paneer Sabzi, Dal Tadka, Jeera Rice & 3 Phulkas)",
    category: "Full Meal",
    platesCount: 45,
    unit: "plates",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    preparedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    availableUntil: new Date(Date.now() + 3 * 3600000).toISOString(),
    canteenLocation: "Engineering College Main Canteen, Block A Counter 2",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "surplus-2",
    foodName: "Hyderabadi Veg Dum Biryani with Cucumber Onion Raita",
    category: "Rice Dish",
    platesCount: 30,
    unit: "plates",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    preparedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    availableUntil: new Date(Date.now() + 4 * 3600000).toISOString(),
    canteenLocation: "Engineering College Main Canteen, Hot Prep Station",
    status: "open",
    createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
  },
  {
    id: "surplus-3",
    foodName: "South Indian Breakfast Tiffin (Idli & Medu Vada with Hot Sambar)",
    category: "Snack / Tiffin",
    platesCount: 25,
    unit: "plates",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    preparedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    availableUntil: new Date(Date.now() + 2 * 3600000).toISOString(),
    canteenLocation: "Engineering College Main Canteen, Tiffin Counter",
    status: "open",
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
];

export function getSurplusListings(): SurplusFoodListing[] {
  if (typeof window === "undefined") return INITIAL_SURPLUS_LISTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_SURPLUS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SURPLUS_KEY, JSON.stringify(INITIAL_SURPLUS_LISTINGS));
      return INITIAL_SURPLUS_LISTINGS;
    }
    const parsed = JSON.parse(raw) as SurplusFoodListing[];
    if (parsed.length === 0) {
      localStorage.setItem(STORAGE_SURPLUS_KEY, JSON.stringify(INITIAL_SURPLUS_LISTINGS));
      return INITIAL_SURPLUS_LISTINGS;
    }
    return parsed;
  } catch {
    return INITIAL_SURPLUS_LISTINGS;
  }
}

export function createSurplusListing(listing: Omit<SurplusFoodListing, "id" | "createdAt" | "status">): SurplusFoodListing {
  const newListing: SurplusFoodListing = {
    ...listing,
    id: "surplus-" + Date.now(),
    status: "open",
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const current = getSurplusListings();
      const updated = [newListing, ...current];
      localStorage.setItem(STORAGE_SURPLUS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("smart_canteen_surplus_updated"));
    } catch (e) {
      console.error("Failed to save surplus listing:", e);
    }
  }

  return newListing;
}

export function getPickupRequests(): PickupRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_PICKUP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function requestPickup(req: {
  listingId: string;
  foodName: string;
  platesRequested: number;
  totalPlates: number;
  ngoId: string;
  ngoName: string;
  ngoContact: string;
  note?: string;
}): PickupRequest {
  const newReq: PickupRequest = {
    ...req,
    id: "req-" + Date.now(),
    status: "requested",
    requestedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const current = getPickupRequests();
      const updated = [newReq, ...current];
      localStorage.setItem(STORAGE_PICKUP_KEY, JSON.stringify(updated));

      // Update listing status if all plates claimed
      const listings = getSurplusListings();
      const target = listings.find((l) => l.id === req.listingId);
      if (target) {
        if (req.platesRequested >= target.platesCount) {
          target.status = "claimed";
        } else {
          target.platesCount -= req.platesRequested;
        }
        localStorage.setItem(STORAGE_SURPLUS_KEY, JSON.stringify(listings));
      }

      window.dispatchEvent(new Event("smart_canteen_surplus_updated"));
      window.dispatchEvent(new CustomEvent("smart_canteen_new_pickup_request", { detail: newReq }));
    } catch (e) {
      console.error("Failed to save pickup request:", e);
    }
  }

  return newReq;
}

export function updatePickupStatus(requestId: string, status: "approved" | "picked_up"): void {
  if (typeof window === "undefined") return;
  try {
    const current = getPickupRequests();
    const target = current.find((r) => r.id === requestId);
    if (target) {
      target.status = status;
      if (status === "approved") target.approvedAt = new Date().toISOString();
      if (status === "picked_up") target.pickedUpAt = new Date().toISOString();
      localStorage.setItem(STORAGE_PICKUP_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event("smart_canteen_surplus_updated"));
    }
  } catch (e) {
    console.error("Failed to update pickup status:", e);
  }
}

export function deleteSurplusListing(listingId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSurplusListings();
    const updated = current.filter((l) => l.id !== listingId);
    localStorage.setItem(STORAGE_SURPLUS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("smart_canteen_surplus_updated"));
  } catch (e) {
    console.error("Failed to delete surplus listing:", e);
  }
}
