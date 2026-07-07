import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { fetchReviews, updateReview, deleteReview } from "@/lib/reviews-admin";
import { Star, Check, Trash2, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/avis")({
  component: AdminReviews,
});

function AdminReviews() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-reviews"], queryFn: () => fetchReviews(true) });
  const [reply, setReply] = useState<Record<string, string>>({});

  async function publish(id: string, publish: boolean) {
    try {
      await updateReview(id, { is_published: publish });
      toast.success(publish ? "Avis publié" : "Avis masqué");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function sendReply(id: string) {
    try {
      await updateReview(id, { admin_reply: reply[id], is_published: true });
      toast.success("Réponse enregistrée");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader label="Réputation" title="Avis clients" subtitle="Modérez les notes et commentaires, publiez ou répondez aux avis." />

      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-muted-foreground">Aucun avis pour le moment.</p>
        ) : (
          data.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <span className="font-medium">{r.author_name}</span>
                  <div className="mt-1 flex gap-0.5 text-gold">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
                  </div>
                </div>
                <span className={`text-xs uppercase ${r.is_published ? "text-green-600" : "text-muted-foreground"}`}>
                  {r.is_published ? "Publié" : "Masqué"}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>
              {r.admin_reply && (
                <p className="mt-3 rounded-lg bg-secondary/50 p-3 text-sm"><strong>Réponse :</strong> {r.admin_reply}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="goldOutline" onClick={() => publish(r.id, !r.is_published)}>
                  <Check className="mr-1 size-4" />{r.is_published ? "Masquer" : "Publier"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteReview(r.id).then(() => qc.invalidateQueries({ queryKey: ["admin-reviews"] }))}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  placeholder="Réponse de l'hôtel…"
                  className="flex-1 rounded-md border px-3 py-2 text-sm"
                  value={reply[r.id] ?? r.admin_reply ?? ""}
                  onChange={(e) => setReply((prev) => ({ ...prev, [r.id]: e.target.value }))}
                />
                <Button size="sm" variant="hero" onClick={() => sendReply(r.id)}>
                  <MessageSquare className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
