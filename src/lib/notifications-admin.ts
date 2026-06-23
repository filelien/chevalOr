import { supabase } from "@/integrations/supabase/client";

export type AdminNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export async function fetchNotifications() {
  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as AdminNotification[];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("admin_notifications").update({ is_read: true }).eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.from("admin_notifications").update({ is_read: true }).eq("is_read", false);
  if (error) throw error;
}
