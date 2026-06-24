import { defineEventHandler, setHeader } from "h3";
import { buildSitemapXml } from "../src/lib/seo";

export default defineEventHandler(async (event) => {
  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  let roomPaths: string[] = [];
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("rooms").select("id").eq("is_active", true);
    roomPaths = (data ?? []).map((r) => `/chambres/${r.id}`);
  } catch {
    /* sitemap statique si service role indisponible */
  }
  return buildSitemapXml(roomPaths);
});
