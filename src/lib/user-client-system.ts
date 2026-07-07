/**
 * User vs Client Management System
 * Distinction stricte entre Utilisateurs (personnel) et Clients (réservants publics)
 */

import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "manager" | "reception" | "kitchen" | "housekeeping" | "maintenance" | "accounting";
export type UserType = "staff" | "client";

export type StaffUser = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  department: string;
  job_title: string;
  roles: UserRole[];
  status: "active" | "inactive" | "on_leave";
  hire_date: string;
  salary?: number;
  manager_id?: string;
  created_at: string;
  updated_at: string;
};

export type ClientProfile = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  gender?: "M" | "F" | "Other";
  date_of_birth?: string;
  nationality?: string;
  passport_number?: string;
  preferred_language: "fr" | "en";
  marketing_consent: boolean;
  total_spent: number;
  reservation_count: number;
  first_booking_date?: string;
  last_booking_date?: string;
  vip_level: "standard" | "silver" | "gold" | "platinum";
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type UserContext = {
  type: UserType;
  id: string;
  email: string;
  name: string;
  avatar?: string;
};

/**
 * Détermine si c'est un utilisateur staff ou client
 */
export async function getUserContext(userId: string): Promise<UserContext | null> {
  try {
    // Chercher dans staff_users d'abord
    const { data: staff, error: staffError } = await supabase
      .from("staff_users")
      .select("id, email, full_name")
      .eq("id", userId)
      .single();

    if (!staffError && staff) {
      return {
        type: "staff",
        id: staff.id,
        email: staff.email,
        name: staff.full_name,
      };
    }

    // Sinon chercher dans profiles (clients)
    const { data: client, error: clientError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", userId)
      .single();

    if (!clientError && client) {
      return {
        type: "client",
        id: client.id,
        email: client.email,
        name: client.full_name,
      };
    }

    return null;
  } catch (err) {
    console.error("[user-client-system] Erreur context:", err);
    return null;
  }
}

/**
 * Crée un nouvel utilisateur staff
 */
export async function createStaffUser(input: Omit<StaffUser, "id" | "created_at" | "updated_at">): Promise<StaffUser> {
  try {
    const { data, error } = await supabase
      .from("staff_users")
      .insert({
        email: input.email,
        full_name: input.full_name,
        phone: input.phone,
        department: input.department,
        job_title: input.job_title,
        roles: input.roles,
        status: input.status || "active",
        hire_date: input.hire_date,
        salary: input.salary,
        manager_id: input.manager_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[user-client-system] Erreur create staff:", err);
    throw err;
  }
}

/**
 * Crée ou met à jour un profil client
 */
export async function upsertClientProfile(input: Partial<ClientProfile> & { id?: string; email: string }): Promise<ClientProfile> {
  try {
    const profile = {
      email: input.email,
      full_name: input.full_name,
      phone: input.phone,
      address: input.address,
      city: input.city,
      country: input.country,
      gender: input.gender,
      date_of_birth: input.date_of_birth,
      nationality: input.nationality,
      passport_number: input.passport_number,
      preferred_language: input.preferred_language || "fr",
      marketing_consent: input.marketing_consent ?? false,
      vip_level: input.vip_level || "standard",
      notes: input.notes,
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profile, { onConflict: "email" })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[user-client-system] Erreur upsert client:", err);
    throw err;
  }
}

/**
 * Récupère les stats de tous les clients
 */
export async function getClientStats(): Promise<{
  total_clients: number;
  vip_count: number;
  gold_count: number;
  silver_count: number;
  new_this_month: number;
  avg_reservations: number;
}> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("vip_level, created_at, reservation_count")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const stats = {
      total_clients: data?.length ?? 0,
      vip_count: data?.filter((p: any) => p.vip_level === "platinum").length ?? 0,
      gold_count: data?.filter((p: any) => p.vip_level === "gold").length ?? 0,
      silver_count: data?.filter((p: any) => p.vip_level === "silver").length ?? 0,
      new_this_month: data?.filter((p: any) => new Date(p.created_at) >= new Date(thisMonth)).length ?? 0,
      avg_reservations:
        (data?.reduce((sum: number, p: any) => sum + (p.reservation_count ?? 0), 0) ?? 0) / (data?.length ?? 1),
    };

    return stats;
  } catch (err) {
    console.error("[user-client-system] Erreur stats clients:", err);
    return {
      total_clients: 0,
      vip_count: 0,
      gold_count: 0,
      silver_count: 0,
      new_this_month: 0,
      avg_reservations: 0,
    };
  }
}

/**
 * Récupère les stats de tous les staffs
 */
export async function getStaffStats(): Promise<{
  total_staff: number;
  active_count: number;
  by_department: Record<string, number>;
}> {
  try {
    const { data, error } = await supabase
      .from("staff_users")
      .select("status, department");

    if (error) throw error;

    const byDept: Record<string, number> = {};
    data?.forEach((s: any) => {
      byDept[s.department] = (byDept[s.department] ?? 0) + 1;
    });

    return {
      total_staff: data?.length ?? 0,
      active_count: data?.filter((s: any) => s.status === "active").length ?? 0,
      by_department: byDept,
    };
  } catch (err) {
    console.error("[user-client-system] Erreur stats staff:", err);
    return {
      total_staff: 0,
      active_count: 0,
      by_department: {},
    };
  }
}

/**
 * Mise à jour niveau VIP client basée sur dépenses/réservations
 */
export async function updateClientVipLevel(clientId: string): Promise<void> {
  try {
    const { data: client, error: clientError } = await supabase
      .from("profiles")
      .select("total_spent, reservation_count")
      .eq("id", clientId)
      .single();

    if (clientError || !client) throw new Error("Client not found");

    const spent = client.total_spent ?? 0;
    const reservations = client.reservation_count ?? 0;

    let vip_level: "standard" | "silver" | "gold" | "platinum" = "standard";
    if (spent > 1000000 || reservations > 10) vip_level = "platinum";
    else if (spent > 500000 || reservations > 5) vip_level = "gold";
    else if (spent > 200000 || reservations > 2) vip_level = "silver";

    await supabase
      .from("profiles")
      .update({ vip_level })
      .eq("id", clientId);
  } catch (err) {
    console.error("[user-client-system] Erreur VIP level:", err);
  }
}
