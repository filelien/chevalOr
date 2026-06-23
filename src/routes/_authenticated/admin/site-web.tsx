import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { getSiteSetting, setSiteSetting } from "@/lib/site-settings";
import { HOTEL } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/site-web")({
  component: AdminSiteWeb,
});

type HotelInfo = { tagline: string; slogan: string; address: string; phone?: string; email?: string };

function AdminSiteWeb() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site-hotel-info"],
    queryFn: () =>
      getSiteSetting<HotelInfo>("hotel_info", {
        tagline: HOTEL.tagline,
        slogan: HOTEL.slogan,
        address: HOTEL.address,
        phone: HOTEL.phone,
        email: HOTEL.email,
      }),
  });

  const [form, setForm] = useState<HotelInfo>({
    tagline: HOTEL.tagline,
    slogan: HOTEL.slogan,
    address: HOTEL.address,
    phone: HOTEL.phone,
    email: HOTEL.email,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  async function save() {
    try {
      await setSiteSetting("hotel_info", form);
      toast.success("Contenu du site mis à jour");
      qc.invalidateQueries({ queryKey: ["site-hotel-info"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur — migration Supabase requise");
    }
  }

  const pages = [
    { name: "Accueil", path: "/", note: "SEO + galerie + avis dynamiques" },
    { name: "À propos", path: "/a-propos", note: "Contenu éditorial (CMS pages à venir)" },
    { name: "Chambres", path: "/chambres", note: "Synchronisé module Chambres" },
    { name: "Galerie", path: "/galerie", note: "Synchronisé Médiathèque" },
    { name: "Événements", path: "/evenements", note: "Formulaires conférence & événements" },
    { name: "Contact", path: "/contact", note: "Coordonnées ci-dessous" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="CMS"
        title="Gestion du site web"
        subtitle="Modifiez les informations clés affichées sur le site public en temps réel."
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl">Informations hôtel</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(["tagline", "slogan", "address", "phone", "email"] as const).map((key) => (
            <label key={key} className="block text-sm sm:col-span-2">
              <span className="capitalize text-muted-foreground">{key}</span>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={form[key] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </label>
          ))}
        </div>
        <Button className="mt-4" variant="hero" onClick={save}>Enregistrer</Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl">Pages du site</h2>
        <ul className="mt-4 space-y-3">
          {pages.map((p) => (
            <li key={p.path} className="flex flex-wrap justify-between gap-2 border-b border-border/60 pb-3 text-sm">
              <span className="font-medium">{p.name} <span className="text-muted-foreground">({p.path})</span></span>
              <span className="text-muted-foreground">{p.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
