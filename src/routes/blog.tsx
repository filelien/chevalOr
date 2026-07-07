import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { useSiteContent } from "@/hooks/use-site-content";
import { useI18n } from "@/lib/i18n";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [{ title: "Blog — Cheval d'Or" }] }),
  component: BlogPage,
});

function BlogPage() {
  const { BLOG_POSTS } = useSiteContent();
  const { t } = useI18n();

  return (
    <SiteShell>
      <PageHero image={hero} label={t.pages.blog.label} title={t.ui.blog.inspirations} />
      <section className="mx-auto max-w-4xl px-6 py-20 space-y-8">
        {BLOG_POSTS.map((p) => (
          <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }}
            className="block rounded-xl border border-border bg-card p-6 transition hover:shadow-elegant">
            <span className="text-xs uppercase tracking-wider text-gold-deep">{p.category} · {p.readMin} min</span>
            <h2 className="mt-2 font-display text-2xl">{p.title}</h2>
            <p className="mt-2 text-muted-foreground">{p.excerpt}</p>
            <p className="mt-4 text-xs text-muted-foreground">{p.date}</p>
          </Link>
        ))}
      </section>
    </SiteShell>
  );
}
