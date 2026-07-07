/**
 * Entity Code System — codes séquentiels uniques (ROOM-000001, BOOK-000001, etc.)
 */

import { supabase } from "@/integrations/supabase/client";

export type EntityCodePrefix =
  | "HOTEL" | "ROOM" | "FLOOR" | "TABLE" | "MENU" | "CLIENT"
  | "BOOK" | "CHECKIN" | "CHECKOUT" | "ORDER" | "PAYMENT" | "INVOICE"
  | "PRODUCT" | "EMPLOYEE" | "SUPPLIER" | "EXPENSE";

export type EntityCodeRow = {
  id: string;
  prefix: string;
  code: string;
  entity_type: string;
  entity_id: string;
  qr_data: string | null;
  created_at: string;
};

export type EntityCodeSequence = {
  prefix: string;
  last_value: number;
  pad_length: number;
  updated_at: string;
};

export const PREFIX_LABELS: Record<EntityCodePrefix, string> = {
  HOTEL: "Hôtel",
  ROOM: "Chambre",
  FLOOR: "Étage",
  TABLE: "Table",
  MENU: "Menu",
  CLIENT: "Client",
  BOOK: "Réservation",
  CHECKIN: "Check-in",
  CHECKOUT: "Check-out",
  ORDER: "Commande",
  PAYMENT: "Paiement",
  INVOICE: "Facture",
  PRODUCT: "Produit",
  EMPLOYEE: "Employé",
  SUPPLIER: "Fournisseur",
  EXPENSE: "Dépense",
};

export function qrCodeUrl(data: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

export function barcodeUrl(data: string): string {
  return `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(data)}&code=Code128&translate-esc=on`;
}

export async function fetchEntityCodes(filters?: {
  prefix?: string;
  entityType?: string;
  search?: string;
  limit?: number;
}): Promise<EntityCodeRow[]> {
  let q = supabase
    .from("entity_codes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filters?.limit ?? 200);

  if (filters?.prefix) q = q.eq("prefix", filters.prefix);
  if (filters?.entityType) q = q.eq("entity_type", filters.entityType);
  if (filters?.search) q = q.ilike("code", `%${filters.search}%`);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as EntityCodeRow[];
}

export async function fetchEntityCodeSequences(): Promise<EntityCodeSequence[]> {
  const { data, error } = await supabase
    .from("entity_code_sequences")
    .select("*")
    .order("prefix");
  if (error) throw error;
  return (data ?? []) as EntityCodeSequence[];
}

export async function generateEntityCode(prefix: EntityCodePrefix): Promise<string> {
  const { data, error } = await supabase.rpc("generate_entity_code", { _prefix: prefix });
  if (error) throw error;
  return data as string;
}

export async function getEntityCode(entityType: string, entityId: string): Promise<EntityCodeRow | null> {
  const { data } = await supabase
    .from("entity_codes")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();
  return data as EntityCodeRow | null;
}
