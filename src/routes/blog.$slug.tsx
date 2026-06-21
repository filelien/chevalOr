import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { BLOG_POSTS, BLOG_CONTENT } from "@/lib/content";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const paragraphs = BLOG_CONTENT[slug] ?? [];

  if (!post) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl">Article introuvable</h1>
          <Button className="mt-6" asChild><Link to="/blog">Retour au blog</Link></Button>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <span className="text-xs uppercase tracking-wider text-gold-deep">{post.category}</span>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-muted-foreground">{post.date} · {post.readMin} min de lecture</p>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-foreground/90">
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <Button variant="goldOutline" className="mt-12" asChild><Link to="/blog">← Tous les articles</Link></Button>
      </article>
    </SiteShell>
  );
}
