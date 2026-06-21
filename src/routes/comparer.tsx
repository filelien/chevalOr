import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { fetchPublicRooms, formatXOF, ROOM_TYPE_LABEL } from "@/lib/rooms";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/comparer")({
  head: () => ({ meta: [{ title: "Comparer les chambres — Cheval d'Or" }] }),
  component: ComparePage,
});

function ComparePage() {
  const { data: rooms } = useQuery({ queryKey: ["public-rooms"], queryFn: fetchPublicRooms });
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s);
  }

  const compared = (rooms ?? []).filter((r) => selected.includes(r.id));

  return (
    <SiteShell>
      <PageHero image={hero} label="Chambres" title="Comparateur" subtitle="Comparez jusqu'à 3 chambres côte à côte — style Marriott / Peninsula." />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm text-muted-foreground">Sélectionnez les chambres à comparer ({selected.length}/3)</p>
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
                  <th className="p-3 text-left">Critère</th>
                  {compared.map((r) => <th key={r.id} className="p-3 text-left font-display text-lg">{r.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Type", fn: (r: typeof compared[0]) => ROOM_TYPE_LABEL[r.type] },
                  { label: "Capacité", fn: (r: typeof compared[0]) => `${r.capacity} pers.` },
                  { label: "Surface", fn: (r: typeof compared[0]) => r.size_sqm ? `${r.size_sqm} m²` : "—" },
                  { label: "Prix / nuit", fn: (r: typeof compared[0]) => formatXOF(r.price_per_night) },
                  { label: "Équipements", fn: (r: typeof compared[0]) => r.amenities.slice(0, 4).join(", ") || "—" },
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
                      <Button variant="hero" size="sm" asChild><Link to="/chambres/$id" params={{ id: r.id }}>Réserver</Link></Button>
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
