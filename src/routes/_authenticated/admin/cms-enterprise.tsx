import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { toast } from "sonner";
import {
  deleteEnterprisePage,
  fetchEnterpriseForms,
  fetchEnterpriseMedia,
  fetchEnterpriseMenus,
  fetchEnterprisePages,
  fetchFormSubmissions,
  fetchGlobalSeoSettings,
  fetchMenuItems,
  fetchPageSections,
  saveGlobalSeoSettings,
  type CmsPageSection,
  updateEnterprisePageStatus,
  upsertEnterpriseForm,
  upsertEnterpriseMedia,
  upsertEnterpriseMenu,
  upsertEnterprisePage,
  upsertMenuItem,
  upsertPageSection,
  deletePageSection,
  duplicatePageSection,
  deleteMenuItem,
} from "@/lib/cms-enterprise";
import { downloadCsv } from "@/lib/export-csv";
import { BookOpenText, Copy, Download, Eye, EyeOff, ExternalLink, FileText, Image, Images, Menu, Plus, Rocket, Save, Search, Trash2 } from "lucide-react";
import { fetchEditableExperiences, fetchEditableFaq, fetchEditableNewsletter, saveEditableExperiences, saveEditableFaq, saveEditableNewsletter } from "@/lib/site-editable-content";

export const Route = createFileRoute("/_authenticated/admin/cms-enterprise")({
  component: CmsEnterpriseAdminPage,
});

type Tab = "pages" | "workflow" | "sections" | "visuals" | "menus" | "media" | "forms" | "faq" | "experiences" | "newsletter" | "seo";

function CmsEnterpriseAdminPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("pages");
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [selectedMenuId, setSelectedMenuId] = useState<string>("");
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [seoSettings, setSeoSettings] = useState<Record<string, any>>({});
  const [mediaPickerOpenForSectionId, setMediaPickerOpenForSectionId] = useState<string | null>(null);
  const [faqDraft, setFaqDraft] = useState<Array<{ q: string; a: string }>>([]);
  const [experiencesDraft, setExperiencesDraft] = useState<Array<{ title: string; desc: string; price: string; duration: string; image: string }>>([]);
  const [newsletterDraft, setNewsletterDraft] = useState<{ label: string; title: string; subtitle: string; buttonText: string } | null>(null);

  const pagesQ = useQuery({ queryKey: ["cms-enterprise-pages"], queryFn: fetchEnterprisePages });
  const menusQ = useQuery({ queryKey: ["cms-enterprise-menus"], queryFn: fetchEnterpriseMenus });
  const mediaQ = useQuery({ queryKey: ["cms-enterprise-media"], queryFn: fetchEnterpriseMedia });
  const formsQ = useQuery({ queryKey: ["cms-enterprise-forms"], queryFn: fetchEnterpriseForms });
  const seoQ = useQuery({ queryKey: ["cms-enterprise-seo-global"], queryFn: fetchGlobalSeoSettings });
  const sectionsQ = useQuery({
    queryKey: ["cms-enterprise-sections", selectedPageId],
    queryFn: () => fetchPageSections(selectedPageId),
    enabled: !!selectedPageId,
  });
  const menuItemsQ = useQuery({
    queryKey: ["cms-enterprise-menu-items", selectedMenuId],
    queryFn: () => fetchMenuItems(selectedMenuId),
    enabled: !!selectedMenuId,
  });
  const submissionsQ = useQuery({
    queryKey: ["cms-enterprise-form-submissions", selectedFormId],
    queryFn: () => fetchFormSubmissions(selectedFormId || undefined),
  });
  const faqQ = useQuery({ queryKey: ["admin-editable-faq"], queryFn: fetchEditableFaq });
  const experiencesQ = useQuery({ queryKey: ["admin-editable-experiences"], queryFn: fetchEditableExperiences });
  const newsletterQ = useQuery({ queryKey: ["admin-editable-newsletter"], queryFn: fetchEditableNewsletter });

  const pages = pagesQ.data ?? [];
  const menus = menusQ.data ?? [];
  const media = mediaQ.data ?? [];
  const forms = formsQ.data ?? [];
  const sections = sectionsQ.data ?? [];
  const menuItems = menuItemsQ.data ?? [];
  const submissions = submissionsQ.data ?? [];

  useEffect(() => {
    if (pages.length && !selectedPageId) setSelectedPageId(pages[0].id);
    if (menus.length && !selectedMenuId) setSelectedMenuId(menus[0].id);
    if (forms.length && !selectedFormId) setSelectedFormId(forms[0].id);
    if (seoQ.data && Object.keys(seoSettings).length === 0) setSeoSettings(seoQ.data);
    if (faqQ.data && faqDraft.length === 0) setFaqDraft(faqQ.data);
    if (experiencesQ.data && experiencesDraft.length === 0) setExperiencesDraft(experiencesQ.data);
    if (newsletterQ.data && !newsletterDraft) setNewsletterDraft(newsletterQ.data);
  }, [pages, menus, forms, selectedPageId, selectedMenuId, selectedFormId, seoQ.data, seoSettings]);

  const stats = useMemo(() => ({
    pages: pages.length,
    published: pages.filter((p: any) => p.status === "published").length,
    media: media.length,
    forms: forms.length,
  }), [pages, media, forms]);

  const filteredPages = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return pages;
    return pages.filter((p: any) => `${p.title} ${p.path} ${p.slug}`.toLowerCase().includes(s));
  }, [pages, search]);

  async function createItem() {
    try {
      if (tab === "pages") {
        await upsertEnterprisePage({
          slug: (draft.slug || `page-${Date.now()}`).toLowerCase().replace(/\s+/g, "-"),
          title: draft.title || "Nouvelle page",
          path: draft.path || `/${(draft.slug || `page-${Date.now()}`).toLowerCase().replace(/\s+/g, "-")}`,
          status: draft.status || "draft",
          seo_title: draft.seo_title || null,
          seo_description: draft.seo_description || null,
          published_at: draft.published_at || null,
          expires_at: draft.expires_at || null,
        });
        qc.invalidateQueries({ queryKey: ["cms-enterprise-pages"] });
      } else if (tab === "sections") {
        if (!selectedPageId) throw new Error("Sélectionnez une page");
        await upsertPageSection({
          page_id: selectedPageId,
          section_key: (draft.section_key || `section-${Date.now()}`).toLowerCase(),
          section_type: draft.section_type || "text",
          title: draft.title || "Titre section",
          body: draft.body || "Contenu section",
          data: {
            ctaLabel: draft.cta_label || "",
            ctaHref: draft.cta_href || "",
            columns: Number(draft.columns || 1),
          },
          animation: draft.animation || "fade-up",
          sort_order: Number(draft.sort_order || sections.length),
        });
        qc.invalidateQueries({ queryKey: ["cms-enterprise-sections", selectedPageId] });
      } else if (tab === "menus") {
        await upsertEnterpriseMenu({
          key: (draft.key || `menu_${Date.now()}`).toLowerCase(),
          label: draft.label || "Nouveau menu",
          location: draft.location || "header",
          is_active: true,
        });
        qc.invalidateQueries({ queryKey: ["cms-enterprise-menus"] });
        if (selectedMenuId) {
          await upsertMenuItem({
            menu_id: selectedMenuId,
            label: draft.item_label || "Nouveau lien",
            href: draft.href || "/",
            sort_order: Number(draft.sort_order || menuItems.length),
            is_visible: true,
          });
          qc.invalidateQueries({ queryKey: ["cms-enterprise-menu-items", selectedMenuId] });
        }
      } else if (tab === "media") {
        await upsertEnterpriseMedia({
          title: draft.title || "Media",
          file_url: draft.file_url || "https://placehold.co/1200x800",
          media_kind: draft.media_kind || "image",
          alt_text: draft.alt_text || "",
          caption: draft.caption || "",
        });
        qc.invalidateQueries({ queryKey: ["cms-enterprise-media"] });
      } else if (tab === "forms") {
        await upsertEnterpriseForm({
          key: (draft.key || `form_${Date.now()}`).toLowerCase(),
          title: draft.title || "Nouveau formulaire",
          description: draft.description || "",
          fields: [
            { key: "name", label: "Nom", type: "text", required: true },
            { key: "email", label: "Email", type: "email", required: true },
            { key: "message", label: "Message", type: "textarea", required: true },
          ],
          workflow: { notify_email: true, notify_whatsapp: !!draft.notify_whatsapp },
          captcha_enabled: !!draft.captcha_enabled,
          is_active: true,
        });
        qc.invalidateQueries({ queryKey: ["cms-enterprise-forms"] });
      } else if (tab === "seo") {
        await saveGlobalSeoSettings({
          robots: seoSettings.robots || "index,follow",
          twitter_card: seoSettings.twitter_card || "summary_large_image",
          default_og_image: seoSettings.default_og_image || "",
          sitemap_enabled: Boolean(seoSettings.sitemap_enabled),
          schema_org_enabled: Boolean(seoSettings.schema_org_enabled),
        });
        qc.invalidateQueries({ queryKey: ["cms-enterprise-seo-global"] });
      } else if (tab === "faq") {
        await saveEditableFaq(faqDraft);
        qc.invalidateQueries({ queryKey: ["admin-editable-faq"] });
        qc.invalidateQueries({ queryKey: ["public-faq-content"] });
      } else if (tab === "experiences") {
        await saveEditableExperiences(experiencesDraft);
        qc.invalidateQueries({ queryKey: ["admin-editable-experiences"] });
        qc.invalidateQueries({ queryKey: ["public-experiences-content"] });
      } else if (tab === "newsletter") {
        if (!newsletterDraft) throw new Error("Newsletter vide");
        await saveEditableNewsletter(newsletterDraft);
        qc.invalidateQueries({ queryKey: ["admin-editable-newsletter"] });
        qc.invalidateQueries({ queryKey: ["public-newsletter-content"] });
      }
      setDraft({});
      toast.success("Enregistré");
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    }
  }

  async function removePage(id: string) {
    if (!confirm("Supprimer cette page ?")) return;
    await deleteEnterprisePage(id);
    qc.invalidateQueries({ queryKey: ["cms-enterprise-pages"] });
  }

  async function patchPageStatus(id: string, status: "draft" | "published" | "archived" | "scheduled") {
    await updateEnterprisePageStatus(id, status, {
      published_at: status === "published" ? new Date().toISOString() : null,
      expires_at: null,
    });
    qc.invalidateQueries({ queryKey: ["cms-enterprise-pages"] });
    toast.success(`Statut ${status} appliqué`);
  }

  async function toggleSectionVisibility(section: CmsPageSection) {
    await upsertPageSection({
      id: section.id,
      page_id: section.page_id,
      section_key: section.section_key,
      section_type: section.section_type,
      title: section.title ?? "",
      body: section.body ?? "",
      data: section.data ?? {},
      is_visible: !section.is_visible,
      animation: section.animation ?? undefined,
      sort_order: section.sort_order,
    });
    qc.invalidateQueries({ queryKey: ["cms-enterprise-sections", selectedPageId] });
  }

  async function setSectionImage(section: CmsPageSection, imageUrl: string) {
    await upsertPageSection({
      id: section.id,
      page_id: section.page_id,
      section_key: section.section_key,
      section_type: section.section_type,
      title: section.title ?? "",
      body: section.body ?? "",
      data: { ...(section.data ?? {}), image: imageUrl },
      is_visible: section.is_visible,
      animation: section.animation ?? undefined,
      sort_order: section.sort_order,
    });
    qc.invalidateQueries({ queryKey: ["cms-enterprise-sections", selectedPageId] });
    toast.success("Visuel de section mis à jour");
  }

  function exportSubmissionsCsv() {
    const rows = submissions.map((s: any) => [
      s.cms_forms?.key ?? "",
      s.cms_forms?.title ?? "",
      s.status ?? "",
      JSON.stringify(s.payload ?? {}),
      s.created_at ?? "",
    ]);
    downloadCsv(`form-submissions-${new Date().toISOString().slice(0, 10)}.csv`, ["FormKey", "FormTitle", "Status", "Payload", "CreatedAt"], rows);
    toast.success("Export des soumissions prêt");
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminPageHeader
        label="CMS Entreprise"
        title="Back-office 100% administrable"
        subtitle="Pages versionnées, sections dynamiques, menus, médias, formulaires, SEO et workflows de publication."
      >
        <Button size="sm" variant="hero" onClick={() => void createItem()}>
          <Plus className="mr-1 size-4" />Créer / Enregistrer
        </Button>
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Pages" value={stats.pages} Icon={BookOpenText} accent />
        <StatCard label="Publiées" value={stats.published} Icon={Rocket} />
        <StatCard label="Médias" value={stats.media} Icon={Image} />
        <StatCard label="Formulaires" value={stats.forms} Icon={FileText} />
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ["pages", "Pages"],
          ["workflow", "Workflow"],
          ["sections", "Sections dynamiques"],
          ["visuals", "Visuels imbriqués"],
          ["menus", "Menus/Footer"],
          ["media", "Médias"],
          ["forms", "Formulaires"],
          ["faq", "FAQ"],
          ["experiences", "Expériences"],
          ["newsletter", "Newsletter"],
          ["seo", "SEO Global"],
        ] as const).map(([id, label]) => (
          <button key={id} className={`rounded-lg px-3 py-2 text-sm ${tab === id ? "bg-onyx text-white" : "bg-secondary text-foreground/70"}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Ajout rapide ({tab})</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <input className="rounded border px-3 py-2 text-sm" placeholder="Titre / Label / section" value={draft.title || draft.label || draft.section_key || ""} onChange={(e) => setDraft((d: any) => ({ ...d, title: e.target.value, label: e.target.value, section_key: e.target.value }))} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Clé / slug" value={draft.key || draft.slug || ""} onChange={(e) => setDraft((d: any) => ({ ...d, key: e.target.value, slug: e.target.value }))} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Path / URL / body" value={draft.path || draft.file_url || draft.body || ""} onChange={(e) => setDraft((d: any) => ({ ...d, path: e.target.value, file_url: e.target.value, body: e.target.value }))} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Statut/Location/Type" value={draft.status || draft.location || draft.section_type || ""} onChange={(e) => setDraft((d: any) => ({ ...d, status: e.target.value, location: e.target.value, section_type: e.target.value }))} />
        </div>
      </div>

      {tab === "pages" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input className="w-full rounded-md border px-9 py-2 text-sm" placeholder="Rechercher page, slug, url..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-3 py-2">Code</th><th className="px-3 py-2">Titre</th><th className="px-3 py-2">Path</th><th className="px-3 py-2">Statut</th><th className="px-3 py-2">Actions</th></tr>
              </thead>
              <tbody>
                {filteredPages.map((p: any) => (
                  <tr key={p.id} className="border-t border-border/60">
                    <td className="px-3 py-2 font-mono text-xs">{p.entity_code || p.id.slice(0, 8)}</td>
                    <td className="px-3 py-2">{p.title}</td>
                    <td className="px-3 py-2 font-mono text-xs">{p.path}</td>
                    <td className="px-3 py-2">{p.status}</td>
                    <td className="px-3 py-2 flex items-center gap-1">
                      <Button size="sm" variant="ghost" asChild>
                        <a href={`${p.path}?preview=1`} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5" /></a>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void removePage(p.id)}>Supprimer</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "workflow" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(["draft", "scheduled", "published", "archived"] as const).map((state) => (
            <div key={state} className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{state}</p>
              <div className="mt-3 space-y-2">
                {pages.filter((p: any) => p.status === state).map((p: any) => (
                  <div key={p.id} className="rounded border border-border/70 p-2">
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.path}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" onClick={() => void patchPageStatus(p.id, "draft")}>Draft</Button>
                      <Button size="sm" variant="outline" onClick={() => void patchPageStatus(p.id, "scheduled")}>Schedule</Button>
                      <Button size="sm" variant="outline" onClick={() => void patchPageStatus(p.id, "published")}>Publish</Button>
                      <Button size="sm" variant="outline" onClick={() => void patchPageStatus(p.id, "archived")}>Archive</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "sections" && (
        <div className="grid gap-4 lg:grid-cols-[0.35fr_0.65fr]">
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pages</p>
            {pages.map((p: any) => (
              <button key={p.id} onClick={() => setSelectedPageId(p.id)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${selectedPageId === p.id ? "bg-onyx text-white" : "bg-secondary text-foreground/80"}`}>
                {p.title}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Sections (avec duplication/visibilité)</p>
            {sections.map((s) => (
              <div key={s.id} className="rounded-lg border border-border/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{s.title || s.section_key}</p>
                    <p className="text-xs text-muted-foreground">{s.section_type} · order {s.sort_order} · {s.animation || "none"}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => void toggleSectionVisibility(s)}>
                      {s.is_visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void duplicatePageSection(s).then(() => qc.invalidateQueries({ queryKey: ["cms-enterprise-sections", selectedPageId] }))}>
                      <Copy className="size-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => void deletePageSection(s.id).then(() => qc.invalidateQueries({ queryKey: ["cms-enterprise-sections", selectedPageId] }))}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "visuals" && (
        <div className="grid gap-4 lg:grid-cols-[0.35fr_0.65fr]">
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pages du site</p>
            {pages.map((p: any) => (
              <button key={p.id} onClick={() => setSelectedPageId(p.id)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${selectedPageId === p.id ? "bg-onyx text-white" : "bg-secondary text-foreground/80"}`}>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs opacity-80">{p.path}</p>
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Visuels par section (imbriqués par page)</p>
            {sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune section pour cette page.</p>
            ) : sections.map((s) => (
              <div key={s.id} className="rounded-lg border border-border/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{s.title || s.section_key}</p>
                    <p className="text-xs text-muted-foreground">{s.section_type} · order {s.sort_order}</p>
                  </div>
                  <span className={`rounded px-2 py-1 text-[10px] ${s.is_visible ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
                    {s.is_visible ? "Visible" : "Masquée"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {s.data?.image ? (
                    <img src={s.data.image} alt={s.title || "Visuel section"} className="h-20 w-28 rounded border object-cover" />
                  ) : (
                    <div className="flex h-20 w-28 items-center justify-center rounded border border-dashed text-xs text-muted-foreground">
                      Pas d'image
                    </div>
                  )}
                  <div className="flex gap-2">
                    <MediaPicker
                      label="Visuel de section"
                      value={s.data?.image || ""}
                      onChange={(url) => void setSectionImage(s, url)}
                      triggerElement={(
                        <Button size="sm" variant="outline">
                          <Images className="mr-1 size-4" />Choisir image
                        </Button>
                      )}
                      externalOpen={mediaPickerOpenForSectionId === s.id}
                      onExternalOpenChange={(open) => setMediaPickerOpenForSectionId(open ? s.id : null)}
                    />
                    {s.data?.image && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => void setSectionImage(s, "")}>
                        Retirer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "menus" && (
        <div className="grid gap-4 lg:grid-cols-[0.35fr_0.65fr]">
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            {menus.map((m: any) => (
              <button key={m.id} onClick={() => setSelectedMenuId(m.id)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${selectedMenuId === m.id ? "bg-onyx text-white" : "bg-secondary text-foreground/80"}`}>
                <p className="font-medium flex items-center gap-2"><Menu className="size-4" />{m.label}</p>
                <p className="text-xs opacity-80">{m.key} · {m.location}</p>
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Items du menu</p>
            <div className="space-y-2">
              {menuItems.map((i: any) => (
                <div key={i.id} className="flex items-center justify-between rounded border border-border/70 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{i.label}</p>
                    <p className="text-xs text-muted-foreground">{i.href || "—"} · order {i.sort_order}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => void deleteMenuItem(i.id).then(() => qc.invalidateQueries({ queryKey: ["cms-enterprise-menu-items", selectedMenuId] }))}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "media" && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {media.map((m: any) => (
            <div key={m.id} className="rounded-xl border border-border bg-card p-3">
              <img src={m.file_url} alt={m.alt_text || m.title} className="h-32 w-full rounded object-cover" />
              <p className="mt-2 text-sm font-medium">{m.title}</p>
              <p className="text-xs text-muted-foreground">{m.media_kind} · {m.entity_code || "—"}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "forms" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {forms.map((f: any) => (
              <button key={f.id} onClick={() => setSelectedFormId(f.id)} className={`rounded-lg px-3 py-2 text-sm ${selectedFormId === f.id ? "bg-onyx text-white" : "bg-secondary text-foreground/70"}`}>
                {f.title}
              </button>
            ))}
            <Button size="sm" variant="outline" onClick={exportSubmissionsCsv}>
              <Download className="mr-1 size-4" />Exporter soumissions
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-3 py-2">Form</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Payload</th><th className="px-3 py-2">Date</th></tr>
              </thead>
              <tbody>
                {submissions.map((s: any) => (
                  <tr key={s.id} className="border-t border-border/60">
                    <td className="px-3 py-2">{s.cms_forms?.title || s.cms_forms?.key}</td>
                    <td className="px-3 py-2">{s.status}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{JSON.stringify(s.payload || {}).slice(0, 90)}</td>
                    <td className="px-3 py-2 text-xs">{String(s.created_at || "").slice(0, 19).replace("T", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "seo" && (
        <div className="rounded-xl border border-border bg-card p-6 max-w-3xl">
          <h3 className="font-display text-xl">SEO global</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-muted-foreground">Robots</span>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={seoSettings.robots || ""} onChange={(e) => setSeoSettings((s) => ({ ...s, robots: e.target.value }))} />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Twitter card</span>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={seoSettings.twitter_card || ""} onChange={(e) => setSeoSettings((s) => ({ ...s, twitter_card: e.target.value }))} />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="text-muted-foreground">Image OG par défaut</span>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={seoSettings.default_og_image || ""} onChange={(e) => setSeoSettings((s) => ({ ...s, default_og_image: e.target.value }))} />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!seoSettings.sitemap_enabled} onChange={(e) => setSeoSettings((s) => ({ ...s, sitemap_enabled: e.target.checked }))} />
              Sitemap activé
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!seoSettings.schema_org_enabled} onChange={(e) => setSeoSettings((s) => ({ ...s, schema_org_enabled: e.target.checked }))} />
              Schema.org activé
            </label>
          </div>
          <Button className="mt-4" variant="hero" onClick={() => void createItem()}>
            <Save className="mr-1 size-4" />Enregistrer SEO global
          </Button>
        </div>
      )}

      {tab === "newsletter" && newsletterDraft && (
        <div className="rounded-xl border border-border bg-card p-6 max-w-3xl">
          <h3 className="font-display text-xl">Newsletter (homepage)</h3>
          <div className="mt-4 grid gap-3">
            <input className="rounded border px-3 py-2 text-sm" placeholder="Label" value={newsletterDraft.label} onChange={(e) => setNewsletterDraft((n) => n ? { ...n, label: e.target.value } : n)} />
            <input className="rounded border px-3 py-2 text-sm" placeholder="Titre" value={newsletterDraft.title} onChange={(e) => setNewsletterDraft((n) => n ? { ...n, title: e.target.value } : n)} />
            <textarea className="rounded border px-3 py-2 text-sm" rows={3} placeholder="Sous-titre" value={newsletterDraft.subtitle} onChange={(e) => setNewsletterDraft((n) => n ? { ...n, subtitle: e.target.value } : n)} />
            <input className="rounded border px-3 py-2 text-sm" placeholder="Texte bouton" value={newsletterDraft.buttonText} onChange={(e) => setNewsletterDraft((n) => n ? { ...n, buttonText: e.target.value } : n)} />
          </div>
          <Button className="mt-4" variant="hero" onClick={() => void createItem()}>Enregistrer Newsletter</Button>
        </div>
      )}

      {tab === "faq" && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl">Questions fréquentes</h3>
            <Button size="sm" variant="outline" onClick={() => setFaqDraft((f) => [...f, { q: "Nouvelle question", a: "Nouvelle réponse" }])}>Ajouter FAQ</Button>
          </div>
          <div className="mt-4 space-y-3">
            {faqDraft.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-border/70 p-3 space-y-2">
                <input className="w-full rounded border px-3 py-2 text-sm" value={item.q} onChange={(e) => setFaqDraft((f) => f.map((x, i) => i === idx ? { ...x, q: e.target.value } : x))} />
                <textarea className="w-full rounded border px-3 py-2 text-sm" rows={3} value={item.a} onChange={(e) => setFaqDraft((f) => f.map((x, i) => i === idx ? { ...x, a: e.target.value } : x))} />
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setFaqDraft((f) => f.filter((_, i) => i !== idx))}>Supprimer</Button>
              </div>
            ))}
          </div>
          <Button className="mt-4" variant="hero" onClick={() => void createItem()}>Enregistrer FAQ</Button>
        </div>
      )}

      {tab === "experiences" && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl">Expériences (photos modifiables)</h3>
            <Button size="sm" variant="outline" onClick={() => setExperiencesDraft((arr) => [...arr, { title: "Nouvelle expérience", desc: "Description", price: "Sur devis", duration: "Journée", image: "" }])}>Ajouter expérience</Button>
          </div>
          <div className="mt-4 space-y-4">
            {experiencesDraft.map((exp, idx) => (
              <div key={idx} className="rounded-lg border border-border/70 p-4 space-y-2">
                <div className="grid gap-2 md:grid-cols-2">
                  <input className="rounded border px-3 py-2 text-sm" placeholder="Titre" value={exp.title} onChange={(e) => setExperiencesDraft((a) => a.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))} />
                  <input className="rounded border px-3 py-2 text-sm" placeholder="Durée" value={exp.duration} onChange={(e) => setExperiencesDraft((a) => a.map((x, i) => i === idx ? { ...x, duration: e.target.value } : x))} />
                  <input className="rounded border px-3 py-2 text-sm" placeholder="Prix" value={exp.price} onChange={(e) => setExperiencesDraft((a) => a.map((x, i) => i === idx ? { ...x, price: e.target.value } : x))} />
                  <textarea className="rounded border px-3 py-2 text-sm md:col-span-2" rows={2} placeholder="Description" value={exp.desc} onChange={(e) => setExperiencesDraft((a) => a.map((x, i) => i === idx ? { ...x, desc: e.target.value } : x))} />
                </div>
                <MediaPicker
                  label="Photo de l'expérience"
                  value={exp.image}
                  onChange={(url) => setExperiencesDraft((a) => a.map((x, i) => i === idx ? { ...x, image: url } : x))}
                  triggerElement={<Button size="sm" variant="outline"><Images className="mr-1 size-4" />Changer photo</Button>}
                />
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setExperiencesDraft((a) => a.filter((_, i) => i !== idx))}>Supprimer expérience</Button>
              </div>
            ))}
          </div>
          <Button className="mt-4" variant="hero" onClick={() => void createItem()}>Enregistrer Expériences</Button>
        </div>
      )}
    </div>
  );
}
