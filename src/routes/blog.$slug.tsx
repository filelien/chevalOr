import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { useSiteContent } from "@/hooks/use-site-content";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { BLOG_POSTS, BLOG_CONTENT } = useSiteContent();
  const { t, lang } = useI18n();
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const paragraphs = BLOG_CONTENT[slug] ?? [];

  if (!post) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl">{t.common.noResults}</h1>
          <Button className="mt-6" asChild><Link to="/blog">{t.common.back}</Link></Button>
        </div>
      </SiteShell>
    );
  }

  const readLabel = lang === "en" ? "min read" : "min de lecture";

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <span className="text-xs uppercase tracking-wider text-gold-deep">{post.category}</span>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-muted-foreground">{post.date} · {post.readMin} {readLabel}</p>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-foreground/90">
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <Button variant="goldOutline" className="mt-12" asChild>
          <Link to="/blog">← {t.pages.blog.title}</Link>
        </Button>
      </article>
    </SiteShell>
  );
}
