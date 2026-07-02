import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { CmsPageRenderer } from "@/components/site/CmsPageRenderer";
import { fetchCmsPages, findCmsPageByPath } from "@/lib/cms-pages";
import { useMemo } from "react";

export const Route = createFileRoute("/$")({
  component: CmsCatchAllPage,
});

function CmsCatchAllPage() {
  const params = Route.useParams();
  const pathname = params._splat ? `/${params._splat}` : "/";
  const { data: pages = [] } = useQuery({ queryKey: ["cms-pages-catchall"], queryFn: fetchCmsPages });
  const page = useMemo(() => findCmsPageByPath(pathname, pages), [pathname, pages]);

  if (!page?.published) {
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
      <CmsPageRenderer page={page} />
    </SiteShell>
  );
}
