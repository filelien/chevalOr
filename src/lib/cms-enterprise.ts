import { supabase } from "@/integrations/supabase/client";

export type CmsEnterprisePage = {
  id: string;
  entity_code?: string | null;
  slug: string;
  title: string;
  path: string;
  status: "draft" | "published" | "archived" | "scheduled";
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  expires_at?: string | null;
  updated_at?: string;
};

export async function fetchEnterprisePages(): Promise<CmsEnterprisePage[]> {
  const { data, error } = await (supabase as any)
    .from("cms_pages")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CmsEnterprisePage[];
}

export async function upsertEnterprisePage(page: Partial<CmsEnterprisePage> & { slug: string; title: string; path: string }) {
  const payload = {
    ...page,
    updated_by: (await supabase.auth.getUser()).data.user?.id ?? null,
  };
  const { data, error } = await (supabase as any)
    .from("cms_pages")
    .upsert(payload, { onConflict: "slug" })
    .select("*")
    .single();
  if (error) throw error;

  // versioning snapshot
  const pageId = data.id;
  const { data: latest } = await (supabase as any)
    .from("cms_page_versions")
    .select("version_number")
    .eq("page_id", pageId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextVersion = Number(latest?.version_number || 0) + 1;
  await (supabase as any).from("cms_page_versions").insert({
    page_id: pageId,
    version_number: nextVersion,
    snapshot: data,
    notes: "Auto snapshot",
    created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
  });

  return data as CmsEnterprisePage;
}

export async function deleteEnterprisePage(id: string) {
  const { error } = await (supabase as any).from("cms_pages").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchEnterpriseMenus() {
  const { data, error } = await (supabase as any).from("cms_menus").select("*, cms_menu_items(*)").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as any[];
}

export async function upsertEnterpriseMenu(input: { key: string; label: string; location: string; is_active?: boolean }) {
  const { error } = await (supabase as any).from("cms_menus").upsert(input, { onConflict: "key" });
  if (error) throw error;
}

export async function fetchEnterpriseMedia() {
  const { data, error } = await (supabase as any).from("media_assets").select("*").order("updated_at", { ascending: false }).limit(200);
  if (error) throw error;
  return (data ?? []) as any[];
}

export async function upsertEnterpriseMedia(input: Record<string, any>) {
  const { error } = await (supabase as any).from("media_assets").upsert(input);
  if (error) throw error;
}

export async function fetchEnterpriseForms() {
  const { data, error } = await (supabase as any).from("cms_forms").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as any[];
}

export async function upsertEnterpriseForm(input: Record<string, any>) {
  const { error } = await (supabase as any).from("cms_forms").upsert(input, { onConflict: "key" });
  if (error) throw error;
}

export async function fetchFormSubmissions(formId?: string) {
  let q = (supabase as any)
    .from("cms_form_submissions")
    .select("*, cms_forms(title,key)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (formId) q = q.eq("form_id", formId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as any[];
}

export async function updateEnterprisePageStatus(
  id: string,
  status: "draft" | "published" | "archived" | "scheduled",
  dates?: { published_at?: string | null; expires_at?: string | null },
) {
  const { error } = await (supabase as any).from("cms_pages").update({
    status,
    published_at: dates?.published_at ?? null,
    expires_at: dates?.expires_at ?? null,
    updated_by: (await supabase.auth.getUser()).data.user?.id ?? null,
  }).eq("id", id);
  if (error) throw error;
}

export type CmsPageSection = {
  id: string;
  page_id: string;
  section_key: string;
  section_type: string;
  title: string | null;
  body: string | null;
  data: Record<string, any> | null;
  is_visible: boolean;
  animation: string | null;
  sort_order: number;
};

export async function fetchPageSections(pageId: string): Promise<CmsPageSection[]> {
  const { data, error } = await (supabase as any)
    .from("cms_page_sections")
    .select("*")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CmsPageSection[];
}

export async function upsertPageSection(input: Partial<CmsPageSection> & { page_id: string; section_key: string; section_type: string }) {
  const payload = {
    ...input,
    title: input.title ?? "",
    body: input.body ?? "",
    data: input.data ?? {},
    is_visible: input.is_visible ?? true,
    sort_order: input.sort_order ?? 0,
  };
  const { error } = await (supabase as any).from("cms_page_sections").upsert(payload);
  if (error) throw error;
}

export async function deletePageSection(id: string) {
  const { error } = await (supabase as any).from("cms_page_sections").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicatePageSection(section: CmsPageSection) {
  await upsertPageSection({
    page_id: section.page_id,
    section_key: `${section.section_key}-copy-${Date.now()}`,
    section_type: section.section_type,
    title: section.title,
    body: section.body,
    data: section.data ?? {},
    is_visible: section.is_visible,
    animation: section.animation,
    sort_order: (section.sort_order ?? 0) + 1,
  });
}

export async function fetchMenuItems(menuId: string) {
  const { data, error } = await (supabase as any)
    .from("cms_menu_items")
    .select("*")
    .eq("menu_id", menuId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as any[];
}

export async function upsertMenuItem(input: Record<string, any>) {
  const { error } = await (supabase as any).from("cms_menu_items").upsert(input);
  if (error) throw error;
}

export async function deleteMenuItem(id: string) {
  const { error } = await (supabase as any).from("cms_menu_items").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchGlobalSeoSettings() {
  const { data } = await (supabase as any).from("site_settings").select("value").eq("key", "seo_global").maybeSingle();
  return (data?.value ?? {
    robots: "index,follow",
    twitter_card: "summary_large_image",
    default_og_image: "",
    sitemap_enabled: true,
    schema_org_enabled: true,
  }) as Record<string, any>;
}

export async function saveGlobalSeoSettings(value: Record<string, any>) {
  const { error } = await (supabase as any).from("site_settings").upsert({
    key: "seo_global",
    value,
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });
  if (error) throw error;
}

export async function fetchEnterprisePageByPath(path: string, includeNonPublished = false) {
  let q = (supabase as any)
    .from("cms_pages")
    .select("*")
    .eq("path", path)
    .limit(1)
    .maybeSingle();
  if (!includeNonPublished) q = q.eq("status", "published");
  const { data, error } = await q;
  if (error) throw error;
  return data as any | null;
}
