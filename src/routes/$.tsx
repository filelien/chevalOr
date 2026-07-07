import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { CmsPageRenderer } from "@/components/site/CmsPageRenderer";
import { fetchCmsPages, findCmsPageByPath } from "@/lib/cms-pages";
import { fetchEnterprisePageByPath, fetchPageSections } from "@/lib/cms-enterprise";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export const Route = createFileRoute("/$")({
  validateSearch: (search: Record<string, unknown>) => ({
    preview: String(search.preview ?? "") === "1",
  }),
  component: CmsCatchAllPage,
});

function CmsCatchAllPage() {
  const params = Route.useParams();
  const search = Route.useSearch();
  const pathname = params._splat ? `/${params._splat}` : "/";
  const { data: pages = [] } = useQuery({ queryKey: ["cms-pages-catchall"], queryFn: fetchCmsPages });
  const { data: previewAllowed = false } = useQuery({
    queryKey: ["cms-preview-allowed"],
    enabled: search.preview,
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      return (roles ?? []).some((r) => ["super_admin", "manager", "reception"].includes(r.role));
    },
  });
  const { data: enterprisePage } = useQuery({
    queryKey: ["enterprise-catchall", pathname, search.preview, previewAllowed],
    queryFn: () => fetchEnterprisePageByPath(pathname, search.preview && previewAllowed),
  });
  const { data: enterpriseSections = [] } = useQuery({
    queryKey: ["enterprise-catchall-sections", enterprisePage?.id],
    enabled: !!enterprisePage?.id,
    queryFn: () => fetchPageSections(enterprisePage!.id),
  });
  const page = useMemo(() => findCmsPageByPath(pathname, pages), [pathname, pages]);

  const enterpriseAsLegacy = useMemo(() => {
    if (!enterprisePage) return null;
    return {
      id: enterprisePage.id,
      slug: enterprisePage.slug,
      title: enterprisePage.title,
      path: enterprisePage.path,
      description: enterprisePage.seo_description || "",
      published: enterprisePage.status === "published",
      updated_at: enterprisePage.updated_at,
      sections: (enterpriseSections ?? []).map((s: any, i: number) => ({
        id: s.id,
        type: (s.section_type || "text") as "hero" | "text" | "features" | "cta",
        title: s.title || "",
        body: s.body || "",
        image: s.data?.image || "",
        visible: s.is_visible,
        sort_order: s.sort_order ?? i,
        ctaLabel: s.data?.ctaLabel || "",
        ctaHref: s.data?.ctaHref || "",
      })),
    };
  }, [enterprisePage, enterpriseSections]);

  const renderedPage = enterpriseAsLegacy ?? page;

  const canRenderPreview = search.preview && previewAllowed;
  if (!renderedPage || (!renderedPage.published && !canRenderPreview)) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-4xl px-6 py-24">
          <div className="rounded-2xl border border-dashed border-border bg-card/70 p-10 text-center">
            <h1 className="font-display text-3xl">Page introuvable</h1>
            <p className="mt-3 text-muted-foreground">La page demandée n’existe pas ou n’a pas encore été publiée.</p>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <CmsPageRenderer page={renderedPage} />
    </SiteShell>
  );
}
