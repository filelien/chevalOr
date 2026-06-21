import { supabase } from "@/integrations/supabase/client";

export type Room = {
  id: string;
  number: string;
  name: string;
  type: "standard" | "superior" | "deluxe" | "suite" | "family";
  capacity: number;
  price_per_night: number;
  description: string | null;
  amenities: string[];
  size_sqm: number | null;
  status: "available" | "occupied" | "cleaning" | "maintenance" | "reserved";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RoomPhoto = {
  id: string;
  room_id: string;
  url: string;
  sort_order: number;
  is_cover: boolean;
};

export type RoomWithPhotos = Room & { photos: RoomPhoto[] };

export async function fetchPublicRooms(): Promise<RoomWithPhotos[]> {
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*, room_photos(*)")
    .eq("is_active", true)
    .order("price_per_night", { ascending: true });
  if (error) throw error;
  return (rooms ?? []).map((r: any) => ({
    ...r,
    photos: (r.room_photos ?? []).sort((a: RoomPhoto, b: RoomPhoto) => a.sort_order - b.sort_order),
  }));
}

export async function fetchRoom(id: string): Promise<RoomWithPhotos | null> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*, room_photos(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...(data as any),
    photos: ((data as any).room_photos ?? []).sort(
      (a: RoomPhoto, b: RoomPhoto) => a.sort_order - b.sort_order,
    ),
  };
}

export async function fetchAllRooms(): Promise<RoomWithPhotos[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*, room_photos(*)")
    .order("number");
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    ...r,
    photos: (r.room_photos ?? []).sort((a: RoomPhoto, b: RoomPhoto) => a.sort_order - b.sort_order),
  }));
}

export const ROOM_STATUS_LABEL: Record<Room["status"], string> = {
  available: "Disponible",
  occupied: "Occupée",
  cleaning: "Nettoyage",
  maintenance: "Maintenance",
  reserved: "Réservée",
};

export const ROOM_TYPE_LABEL: Record<Room["type"], string> = {
  standard: "Standard",
  superior: "Supérieure",
  deluxe: "Deluxe",
  suite: "Suite",
  family: "Familiale",
};

export const ROOM_STATUS_BADGE: Record<Room["status"], string> = {
  available: "bg-emerald-100 text-emerald-800",
  occupied: "bg-rose-100 text-rose-800",
  cleaning: "bg-sky-100 text-sky-800",
  maintenance: "bg-amber-100 text-amber-800",
  reserved: "bg-violet-100 text-violet-800",
};

export function formatXOF(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}