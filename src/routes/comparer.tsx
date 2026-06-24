import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { fetchPublicRooms, formatXOF } from "@/lib/rooms";
import { useI18n, roomTypeLabel } from "@/lib/i18n";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/comparer")({
  head: () => ({ meta: [{ title: "Comparer les chambres — Cheval d'Or" }] }),
  component: ComparePage,
});

function ComparePage() {
  const { t, lang } = useI18n();
  const u = t.ui.compare;
  const { data: rooms } = useQuery({ queryKey: ["public-rooms"], queryFn: fetchPublicRooms });
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s);
  }

  const compared = (rooms ?? []).filter((r) => selected.includes(r.id));

  return (
    <SiteShell>
      <PageHero image={hero} label={t.pages.compare.label} title={t.pages.compare.title} subtitle={u.subtitle} />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm text-muted-foreground">{u.selectRooms} ({selected.length}/3)</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(rooms ?? []).map((r) => (
            <button key={r.id} onClick={() => toggle(r.id)}
              className={`rounded-full px-4 py-2 text-sm ${selected.includes(r.id) ? "bg-onyx text-white" : "bg-secondary"}`}>
              {r.name}
            </button>
          ))}
        </div>
        {compared.length > 0 && (
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left">{u.criterion}</th>
                  {compared.map((r) => <th key={r.id} className="p-3 text-left font-display text-lg">{r.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: u.type, fn: (r: typeof compared[0]) => roomTypeLabel(r.type, lang) },
                  { label: u.capacity, fn: (r: typeof compared[0]) => `${r.capacity} ${u.persons}` },
                  { label: u.size, fn: (r: typeof compared[0]) => r.size_sqm ? `${r.size_sqm} m²` : "—" },
                  { label: u.price, fn: (r: typeof compared[0]) => formatXOF(r.price_per_night) },
                  { label: u.amenities, fn: (r: typeof compared[0]) => r.amenities.slice(0, 4).join(", ") || "—" },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-border/60">
                    <td className="p-3 font-medium">{row.label}</td>
                    {compared.map((r) => <td key={r.id} className="p-3">{row.fn(r)}</td>)}
                  </tr>
                ))}
                <tr>
                  <td className="p-3" />
                  {compared.map((r) => (
                    <td key={r.id} className="p-3">
                      <Button variant="hero" size="sm" asChild><Link to="/chambres/$id" params={{ id: r.id }}>{u.book}</Link></Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
