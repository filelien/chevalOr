import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  fetchCmsPages, upsertCmsPage, deleteCmsPage, type CmsPage, type CmsPageSection,
} from "@/lib/cms-pages";
import { getSiteSetting, setSiteSetting } from "@/lib/site-settings";
import { HOTEL } from "@/lib/content";
import { Plus, Pencil, Trash2, ExternalLink, Eye, EyeOff, Building2, Palette, Layers3, MessageSquareText } from "lucide-react";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { DEFAULT_APPEARANCE, getAppearance, setAppearance, type AppAppearance } from "@/lib/cms-pages";
import { DEFAULT_GLOBAL_CONTENT, mergeHotelInfo, type GlobalContent, type HotelInfoCms } from "@/lib/cms";

export const Route = createFileRoute("/_authenticated/admin/site-web")({
  component: AdminSiteWeb,
});

type SiteTab = "pages" | "hotel" | "theme" | "content";

type HotelForm = ReturnType<typeof mergeHotelInfo>;

function AdminSiteWeb() {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("site.manage");
  const [tab, setTab] = useState<SiteTab>("pages");
  const [editing, setEditing] = useState<CmsPage | null>(null);

  const { data: pages = [] } = useQuery({ queryKey: ["cms-pages"], queryFn: fetchCmsPages });
  const { data: hotelInfoData } = useQuery({
    queryKey: ["site-hotel-info"],
    queryFn: () => getSiteSetting<HotelInfoCms>("hotel_info", {}),
  });
  const { data: globalContentData } = useQuery({
    queryKey: ["site-global-content"],
    queryFn: () => getSiteSetting<GlobalContent>("global_content", DEFAULT_GLOBAL_CONTENT),
  });
  const { data: appearanceData } = useQuery({
    queryKey: ["site-appearance"],
    queryFn: getAppearance,
  });

  const [hotel, setHotel] = useState<HotelForm>(() => mergeHotelInfo({
    name: HOTEL.name,
    tagline: HOTEL.tagline,
    slogan: HOTEL.slogan,
    address: HOTEL.address,
    phone: HOTEL.phone,
    email: HOTEL.email,
    whatsapp: HOTEL.whatsapp,
    social: HOTEL.social,
    hours: HOTEL.hours,
  }));
  const [globalContent, setGlobalContent] = useState<GlobalContent>(DEFAULT_GLOBAL_CONTENT);
  const [appearance, setAppearanceState] = useState<AppAppearance>(DEFAULT_APPEARANCE);

  useEffect(() => {
    if (hotelInfoData) setHotel(mergeHotelInfo(hotelInfoData));
  }, [hotelInfoData]);

  useEffect(() => {
    if (globalContentData) setGlobalContent({ ...DEFAULT_GLOBAL_CONTENT, ...globalContentData });
  }, [globalContentData]);

  useEffect(() => {
    if (appearanceData) setAppearanceState(appearanceData);
  }, [appearanceData]);

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
    await setSiteSetting("hotel_info", {
      name: hotel.name,
      description: hotel.description,
      tagline: hotel.tagline,
      slogan: hotel.slogan,
      address: hotel.address,
      phone: hotel.phone,
      email: hotel.email,
      whatsapp: hotel.whatsapp,
      social: hotel.social,
      hours: hotel.hours,
      banking: hotel.banking,
    });
    toast.success("Informations hôtel mises à jour");
    qc.invalidateQueries({ queryKey: ["hotel-info-cms"] });
  }

  async function saveContent() {
    await setSiteSetting("global_content", globalContent);
    toast.success("Contenus globaux enregistrés");
    qc.invalidateQueries({ queryKey: ["site-global-content"] });
  }

  async function saveAppearanceSettings() {
    await setAppearance(appearance);
    toast.success("Apparence enregistrée");
    qc.invalidateQueries({ queryKey: ["site-appearance"] });
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminPageHeader
        label="CMS · Site vitrine"
        title="Gestion du site web"
        subtitle="Éditeur de pages, contenus globaux, apparence visuelle et configuration premium du site public."
      >
        {canEdit && tab === "pages" && (
          <Button variant="hero" size="sm" onClick={() => setEditing({
            id: `page-${Date.now()}`,
            slug: "nouvelle-page",
            title: "Nouvelle page",
            path: "/nouvelle-page",
            description: "",
            published: false,
            sections: [{ id: "s1", type: "text", title: "Titre", body: "Contenu…", visible: true, sort_order: 0 }],
          })}>
            <Plus className="mr-1 size-4" />Nouvelle page
          </Button>
        )}
      </AdminPageHeader>

      <div className="flex flex-wrap gap-2 border-b border-border pb-1">
        {(["pages", "hotel", "theme", "content"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium ${tab === t ? "border-b-2 border-gold-deep text-gold-deep" : "text-muted-foreground"}`}>
            {t === "pages" ? "Pages CMS" : t === "hotel" ? "Infos hôtel" : t === "theme" ? "Apparence" : "Contenus globaux"}
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
                  <p className="mt-2 text-xs text-muted-foreground">{p.sections.filter((s) => s.visible !== false).length} section(s) visible(s)</p>
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
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-gold-deep"><Building2 className="size-5" /><h2 className="font-display text-xl">Profil hôtelier</h2></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {([
                ["name", "Nom"],
                ["tagline", "Tagline"],
                ["slogan", "Slogan"],
                ["address", "Adresse"],
                ["phone", "Téléphone"],
                ["email", "Email"],
                ["whatsapp", "WhatsApp"],
                ["banking", "Coordonnées bancaires"],
              ] as const).map(([key, label]) => (
                <label key={key} className="block text-sm sm:col-span-2">
                  <span className="text-muted-foreground">{label}</span>
                  <input className="mt-1 w-full rounded-md border px-3 py-2" value={hotel[key] ?? ""} disabled={!canEdit}
                    onChange={(e) => setHotel((h) => ({ ...h, [key]: e.target.value }))} />
                </label>
              ))}
              <label className="text-sm sm:col-span-2">
                <span className="text-muted-foreground">Description</span>
                <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={3} value={hotel.description ?? ""} disabled={!canEdit}
                  onChange={(e) => setHotel((h) => ({ ...h, description: e.target.value }))} />
              </label>
              {(["checkIn", "checkOut", "restaurant"] as const).map((key) => (
                <label key={key} className="block text-sm">
                  <span className="text-muted-foreground capitalize">{key}</span>
                  <input className="mt-1 w-full rounded-md border px-3 py-2" value={hotel.hours?.[key] ?? ""} disabled={!canEdit}
                    onChange={(e) => setHotel((h) => ({ ...h, hours: { ...h.hours, [key]: e.target.value } }))} />
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(["facebook", "instagram", "linkedin", "tiktok", "twitter", "youtube"] as const).map((key) => (
                <label key={key} className="block text-sm">
                  <span className="text-muted-foreground capitalize">{key}</span>
                  <input className="mt-1 w-full rounded-md border px-3 py-2" value={hotel.social?.[key] ?? ""} disabled={!canEdit}
                    onChange={(e) => setHotel((h) => ({ ...h, social: { ...h.social, [key]: e.target.value } }))} />
                </label>
              ))}
            </div>
            {canEdit && <Button className="mt-4" variant="hero" onClick={() => void saveHotel()}>Enregistrer</Button>}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-gold-deep"><MessageSquareText className="size-5" /><h2 className="font-display text-xl">Messages commerciaux</h2></div>
            <p className="mt-2 text-sm text-muted-foreground">Ces messages sont réutilisables dans le bouton flottant WhatsApp et les parcours de réservation.</p>
            <div className="mt-4 space-y-3">
              {([
                ["reservationMessage", "Réservation générale"],
                ["reservationMessageRoom", "Réservation chambre"],
                ["reservationMessageRestaurant", "Réservation restaurant"],
                ["reservationMessageEvent", "Réservation événement"],
              ] as const).map(([key, label]) => (
                <label key={key} className="block text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={2} value={globalContent[key] ?? ""} onChange={(e) => setGlobalContent((c) => ({ ...c, [key]: e.target.value }))} />
                </label>
              ))}
            </div>
            {canEdit && <Button className="mt-4" variant="outline" onClick={() => void saveContent()}>Enregistrer les templates</Button>}
          </div>
        </div>
      )}

      {tab === "theme" && (
        <div className="rounded-xl border border-border bg-card p-6 max-w-2xl">
          <div className="flex items-center gap-2 text-gold-deep"><Palette className="size-5" /><h2 className="font-display text-xl">Thème & identité visuelle</h2></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-muted-foreground">Échelle de police</span>
              <select className="mt-1 w-full rounded-md border px-3 py-2" value={appearance.fontScale} onChange={(e) => setAppearanceState({ ...appearance, fontScale: e.target.value as AppAppearance["fontScale"] })}>
                <option value="small">Petite</option>
                <option value="normal">Normale</option>
                <option value="large">Large</option>
                <option value="xlarge">Très large</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Thème</span>
              <select className="mt-1 w-full rounded-md border px-3 py-2" value={appearance.theme} onChange={(e) => setAppearanceState({ ...appearance, theme: e.target.value as AppAppearance["theme"] })}>
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="auto">Auto</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Palette</span>
              <select className="mt-1 w-full rounded-md border px-3 py-2" value={appearance.accent} onChange={(e) => setAppearanceState({ ...appearance, accent: e.target.value as AppAppearance["accent"] })}>
                <option value="gold">Or</option>
                <option value="emerald">Émeraude</option>
                <option value="blue">Bleu</option>
                <option value="violet">Violet</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Police principale</span>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={(appearance as AppAppearance & { fontFamily?: string }).fontFamily ?? "Inter, sans-serif"} onChange={(e) => setAppearanceState({ ...appearance, ...( { fontFamily: e.target.value } as AppAppearance & { fontFamily?: string }) })} />
            </label>
          </div>
          {canEdit && <Button className="mt-4" variant="hero" onClick={() => void saveAppearanceSettings()}>Appliquer le thème</Button>}
        </div>
      )}

      {tab === "content" && (
        <div className="rounded-xl border border-border bg-card p-6 max-w-2xl">
          <div className="flex items-center gap-2 text-gold-deep"><Layers3 className="size-5" /><h2 className="font-display text-xl">Contenus globaux réutilisables</h2></div>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">Texte de pied de page</span>
              <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={3} value={globalContent.footerTagline} onChange={(e) => setGlobalContent({ ...globalContent, footerTagline: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Message réservation générique</span>
              <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={2} value={globalContent.reservationMessage} onChange={(e) => setGlobalContent({ ...globalContent, reservationMessage: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Message réservation chambre</span>
              <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={2} value={globalContent.reservationMessageRoom} onChange={(e) => setGlobalContent({ ...globalContent, reservationMessageRoom: e.target.value })} />
            </label>
          </div>
          {canEdit && <Button className="mt-4" variant="hero" onClick={() => void saveContent()}>Enregistrer le contenu global</Button>}
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
                <div className="flex items-center justify-between gap-2">
                  <select className="w-full rounded-md border px-2 py-1 text-sm" value={s.type}
                    onChange={(e) => {
                      const sections = [...editing.sections];
                      sections[i] = { ...s, type: e.target.value as CmsPageSection["type"] };
                      setEditing({ ...editing, sections });
                    }}>
                    <option value="hero">Hero</option>
                    <option value="text">Texte</option>
                    <option value="features">Fonctionnalités</option>
                    <option value="cta">Appel à l'action</option>
                  </select>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" checked={s.visible !== false} onChange={(e) => {
                      const sections = [...editing.sections];
                      sections[i] = { ...s, visible: e.target.checked };
                      setEditing({ ...editing, sections });
                    }} />
                    Visible
                  </label>
                </div>
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
                <input type="number" className="w-full rounded-md border px-3 py-2 text-sm" value={s.sort_order ?? i} onChange={(e) => {
                  const sections = [...editing.sections];
                  sections[i] = { ...s, sort_order: Number(e.target.value) };
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
              sections: [...editing.sections, { id: `s-${Date.now()}`, type: "text", title: "", body: "", visible: true, sort_order: editing.sections.length }],
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
