import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  fetchCmsPages, upsertCmsPage, deleteCmsPage, type CmsPage,
} from "@/lib/cms-pages";
import { getSiteSetting, setSiteSetting } from "@/lib/site-settings";
import { HOTEL } from "@/lib/content";
import { Plus, Pencil, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { MediaPicker } from "@/components/admin/media/MediaPicker";

export const Route = createFileRoute("/_authenticated/admin/site-web")({
  component: AdminSiteWeb,
});

type HotelInfo = { tagline: string; slogan: string; address: string; phone?: string; email?: string };

function AdminSiteWeb() {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("site.manage");
  const [tab, setTab] = useState<"pages" | "hotel">("pages");
  const [editing, setEditing] = useState<CmsPage | null>(null);

  const { data: pages = [] } = useQuery({ queryKey: ["cms-pages"], queryFn: fetchCmsPages });
  const { data: hotelInfo } = useQuery({
    queryKey: ["site-hotel-info"],
    queryFn: () => getSiteSetting<HotelInfo>("hotel_info", {
      tagline: HOTEL.tagline, slogan: HOTEL.slogan, address: HOTEL.address,
      phone: HOTEL.phone, email: HOTEL.email,
    }),
  });

  const [hotel, setHotel] = useState<HotelInfo>({
    tagline: HOTEL.tagline, slogan: HOTEL.slogan, address: HOTEL.address,
    phone: HOTEL.phone, email: HOTEL.email,
  });

  useEffect(() => {
    if (hotelInfo) setHotel(hotelInfo);
  }, [hotelInfo]);

  async function savePage() {
    if (!editing || !canEdit) return;
    await upsertCmsPage(editing);
    toast.success("Page enregistrée");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["cms-pages"] });
  }

  async function removePage(id: string) {
    if (!confirm("Supprimer cette page CMS ?")) return;
    await deleteCmsPage(id);
    toast.success("Page supprimée");
    qc.invalidateQueries({ queryKey: ["cms-pages"] });
  }

  async function saveHotel() {
    await setSiteSetting("hotel_info", hotel);
    toast.success("Informations hôtel mises à jour");
    qc.invalidateQueries({ queryKey: ["hotel-info-cms"] });
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminPageHeader
        label="CMS · Site vitrine"
        title="Gestion du site web"
        subtitle="Éditeur de pages, contenu dynamique et synchronisation temps réel avec le site public."
      >
        {canEdit && tab === "pages" && (
          <Button variant="hero" size="sm" onClick={() => setEditing({
            id: `page-${Date.now()}`,
            slug: "nouvelle-page",
            title: "Nouvelle page",
            path: "/nouvelle-page",
            description: "",
            published: false,
            sections: [{ id: "s1", type: "text", title: "Titre", body: "Contenu…" }],
          })}>
            <Plus className="mr-1 size-4" />Nouvelle page
          </Button>
        )}
      </AdminPageHeader>

      <div className="flex gap-2 border-b border-border pb-1">
        {(["pages", "hotel"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium ${tab === t ? "border-b-2 border-gold-deep text-gold-deep" : "text-muted-foreground"}`}>
            {t === "pages" ? "Pages CMS" : "Infos hôtel"}
          </button>
        ))}
      </div>

      {tab === "pages" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {pages.map((p) => (
            <article key={p.id} className="cms-page-card group rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-gold-deep/30 hover:shadow-elegant">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl">{p.title}</h3>
                    {p.published ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700"><Eye className="size-3" />Publié</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><EyeOff className="size-3" />Brouillon</span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{p.path}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{p.sections.length} section(s)</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="ghost" asChild>
                    <a href={p.path} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /></a>
                  </Button>
                  {canEdit && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(p)}><Pencil className="size-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => removePage(p.id)}><Trash2 className="size-4 text-destructive" /></Button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "hotel" && (
        <div className="rounded-xl border border-border bg-card p-6 max-w-2xl">
          <h2 className="font-display text-xl">Coordonnées & identité</h2>
          <div className="mt-4 grid gap-4">
            {(["tagline", "slogan", "address", "phone", "email"] as const).map((key) => (
              <label key={key} className="block text-sm">
                <span className="capitalize text-muted-foreground">{key}</span>
                <input className="mt-1 w-full rounded-md border px-3 py-2" value={hotel[key] ?? ""} disabled={!canEdit}
                  onChange={(e) => setHotel((h) => ({ ...h, [key]: e.target.value }))} />
              </label>
            ))}
          </div>
          {canEdit && <Button className="mt-4" variant="hero" onClick={saveHotel}>Enregistrer</Button>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-card p-6 shadow-2xl">
            <h2 className="font-display text-2xl">Éditer : {editing.title}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Titre<input className="mt-1 w-full rounded-md border px-3 py-2" value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></label>
              <label className="text-sm">Chemin<input className="mt-1 w-full rounded-md border px-3 py-2" value={editing.path}
                onChange={(e) => setEditing({ ...editing, path: e.target.value })} /></label>
              <label className="text-sm sm:col-span-2">Description<textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={2} value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></label>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                Publié sur le site
              </label>
            </div>
            <h3 className="mt-6 font-medium">Sections</h3>
            {editing.sections.map((s, i) => (
              <div key={s.id} className="mt-3 rounded-lg border p-3 space-y-2">
                <select className="w-full rounded-md border px-2 py-1 text-sm" value={s.type}
                  onChange={(e) => {
                    const sections = [...editing.sections];
                    sections[i] = { ...s, type: e.target.value as typeof s.type };
                    setEditing({ ...editing, sections });
                  }}>
                  <option value="hero">Hero</option>
                  <option value="text">Texte</option>
                  <option value="features">Fonctionnalités</option>
                  <option value="cta">Appel à l'action</option>
                </select>
                <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Titre section" value={s.title}
                  onChange={(e) => {
                    const sections = [...editing.sections];
                    sections[i] = { ...s, title: e.target.value };
                    setEditing({ ...editing, sections });
                  }} />
                <textarea className="w-full rounded-md border px-3 py-2 text-sm" rows={3} placeholder="Contenu" value={s.body}
                  onChange={(e) => {
                    const sections = [...editing.sections];
                    sections[i] = { ...s, body: e.target.value };
                    setEditing({ ...editing, sections });
                  }} />
                {(s.type === "hero" || s.type === "cta") && canEdit && (
                  <MediaPicker
                    label="Image de section"
                    value={s.image ?? ""}
                    onChange={(url) => {
                      const sections = [...editing.sections];
                      sections[i] = { ...s, image: url };
                      setEditing({ ...editing, sections });
                    }}
                  />
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setEditing({
              ...editing,
              sections: [...editing.sections, { id: `s-${Date.now()}`, type: "text", title: "", body: "" }],
            })}>+ Section</Button>
            <div className="mt-6 flex gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
              <Button variant="hero" onClick={savePage}>Enregistrer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
