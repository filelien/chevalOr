import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitPublicReview } from "@/lib/public-bookings";
import { Star } from "lucide-react";
import { toast } from "sonner";

export function ReviewForm() {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [author_name, setName] = useState("");
  const [author_email, setEmail] = useState("");
  const [comment, setComment] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitPublicReview({ author_name, author_email: author_email || undefined, rating, comment });
      toast.success("Merci ! Votre avis sera publié après modération.");
      setName("");
      setEmail("");
      setComment("");
      setRating(5);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-lg rounded-xl border border-white/10 bg-white/5 p-6">
      <h3 className="font-display text-lg text-white">Partagez votre expérience</h3>
      <div className="mt-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} étoiles`}>
            <Star className={`size-6 ${n <= rating ? "fill-gold text-gold" : "text-white/30"}`} />
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <input required placeholder="Votre nom" className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50" value={author_name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email (optionnel)" className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50" value={author_email} onChange={(e) => setEmail(e.target.value)} />
        <textarea required placeholder="Votre avis" rows={4} className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50" value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>
      <Button type="submit" variant="hero" className="mt-4" disabled={loading}>{loading ? "Envoi…" : "Publier mon avis"}</Button>
    </form>
  );
}
