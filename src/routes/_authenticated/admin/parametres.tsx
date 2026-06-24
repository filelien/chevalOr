import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SettingsLayout, SettingsCard, OptionCard } from "@/components/admin/SettingsLayout";
import { getSiteSetting, setSiteSetting } from "@/lib/site-settings";
import {
  getAppearance, setAppearance, applyAppearance, DEFAULT_APPEARANCE, type AppAppearance,
} from "@/lib/cms-pages";
import { HOTEL } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { useAdminI18n } from "@/hooks/use-admin-i18n";
import { useI18n, type Lang } from "@/lib/i18n";
import { Shield, Sun, Moon, Monitor, FileText, Bell, Database, HardDrive, Wrench } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/parametres")({
  component: AdminParametres,
});

type HotelSettings = { checkIn: string; checkOut: string; restaurant: string; cancellationPolicy: string };
type PaymentSettings = { cinetpay: boolean; paydunya: boolean; flooz: boolean; tmoney: boolean; cash: boolean };
type EnterpriseSettings = { name: string; legalName: string; address: string; phone: string; email: string; currency: string; timezone: string };
type NotifSettings = { emailAlerts: boolean; reservationNotify: boolean; lowStock: boolean; auditDigest: boolean };
type DocSettings = { invoicePrefix: string; footerText: string; showLogo: boolean };
type AdvancedSettings = { debugMode: boolean; maintenanceMode: boolean };

function AdminParametres() {
  const { ta } = useAdminI18n();
  const { lang, setLang } = useI18n();
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const [section, setSection] = useState("appearance");
  const canEdit = hasPermission("settings.edit");

  const { data: hotelSettings } = useQuery({
    queryKey: ["hotel-settings"],
    queryFn: () => getSiteSetting<HotelSettings>("hotel_settings", {
      checkIn: HOTEL.hours.checkIn, checkOut: HOTEL.hours.checkOut,
      restaurant: HOTEL.hours.restaurant,
      cancellationPolicy: "Annulation gratuite jusqu'à 48h avant l'arrivée.",
    }),
  });
  const { data: paymentSettings } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: () => getSiteSetting<PaymentSettings>("payment_settings", {
      cinetpay: true, paydunya: false, flooz: true, tmoney: true, cash: true,
    }),
  });
  const { data: enterprise } = useQuery({
    queryKey: ["enterprise-settings"],
    queryFn: () => getSiteSetting<EnterpriseSettings>("enterprise_settings", {
      name: "Hôtel Le Cheval d'Or", legalName: "Cheval d'Or SARL",
      address: HOTEL.address, phone: HOTEL.phone, email: HOTEL.email,
      currency: "XOF", timezone: "Africa/Lome",
    }),
  });
  const { data: appearance } = useQuery({ queryKey: ["app-appearance"], queryFn: getAppearance });
  const { data: notifSettings } = useQuery({
    queryKey: ["notif-settings"],
    queryFn: () => getSiteSetting<NotifSettings>("notification_settings", {
      emailAlerts: true, reservationNotify: true, lowStock: true, auditDigest: false,
    }),
  });
  const { data: docSettings } = useQuery({
    queryKey: ["doc-settings"],
    queryFn: () => getSiteSetting<DocSettings>("document_settings", {
      invoicePrefix: "FAC-", footerText: "Hôtel Le Cheval d'Or — Anié, Togo", showLogo: true,
    }),
  });
  const { data: advancedSettings } = useQuery({
    queryKey: ["advanced-settings"],
    queryFn: () => getSiteSetting<AdvancedSettings>("advanced_settings", { debugMode: false, maintenanceMode: false }),
  });

  const [hours, setHours] = useState<HotelSettings>({ checkIn: "", checkOut: "", restaurant: "", cancellationPolicy: "" });
  const [payments, setPayments] = useState<PaymentSettings>({ cinetpay: true, paydunya: false, flooz: true, tmoney: true, cash: true });
  const [ent, setEnt] = useState<EnterpriseSettings>({ name: "", legalName: "", address: "", phone: "", email: "", currency: "XOF", timezone: "Africa/Lome" });
  const [look, setLook] = useState<AppAppearance>(DEFAULT_APPEARANCE);
  const [notif, setNotif] = useState<NotifSettings>({ emailAlerts: true, reservationNotify: true, lowStock: true, auditDigest: false });
  const [docs, setDocs] = useState<DocSettings>({ invoicePrefix: "FAC-", footerText: "", showLogo: true });
  const [adv, setAdv] = useState<AdvancedSettings>({ debugMode: false, maintenanceMode: false });
  const [defaultLang, setDefaultLang] = useState<Lang>("fr");

  useEffect(() => { if (hotelSettings) setHours(hotelSettings); }, [hotelSettings]);
  useEffect(() => { if (paymentSettings) setPayments(paymentSettings); }, [paymentSettings]);
  useEffect(() => { if (enterprise) setEnt(enterprise); }, [enterprise]);
  useEffect(() => { if (appearance) { setLook(appearance); applyAppearance(appearance); } }, [appearance]);
  useEffect(() => { if (notifSettings) setNotif(notifSettings); }, [notifSettings]);
  useEffect(() => { if (docSettings) setDocs(docSettings); }, [docSettings]);
  useEffect(() => { if (advancedSettings) setAdv(advancedSettings); }, [advancedSettings]);
  useEffect(() => {
    getSiteSetting<{ lang: Lang }>("site_default_lang", { lang: "fr" }).then((d) => setDefaultLang(d.lang));
  }, []);

  async function saveAppearance() {
    await setAppearance(look);
    toast.success(ta.common.saved);
    qc.invalidateQueries({ queryKey: ["app-appearance"] });
  }

  return (
    <SettingsLayout active={section} onChange={setSection}>
      {section === "appearance" && (
        <div className="space-y-6">
          <SettingsCard title={ta.settings.fontScale}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {([["small", "Petit", "85%"], ["normal", "Normal", "100%"], ["large", "Grand", "110%"], ["xlarge", "XL", "120%"]] as const).map(([id, label, sub]) => (
                <OptionCard key={id} selected={look.fontScale === id} onClick={() => setLook({ ...look, fontScale: id })} title={label} subtitle={sub} />
              ))}
            </div>
          </SettingsCard>
          <SettingsCard title={ta.settings.theme}>
            <div className="grid grid-cols-3 gap-3">
              {([["light", ta.settings.light, Sun], ["dark", ta.settings.dark, Moon], ["auto", ta.settings.auto, Monitor]] as const).map(([id, label, Icon]) => (
                <OptionCard key={id} selected={look.theme === id} onClick={() => setLook({ ...look, theme: id })} title={label}>
                  <Icon className="size-8 text-gold-deep" />
                </OptionCard>
              ))}
            </div>
          </SettingsCard>
          <SettingsCard title={ta.settings.palette}>
            <div className="flex flex-wrap gap-3">
              {(["gold", "emerald", "blue", "violet"] as const).map((a) => (
                <button key={a} type="button" onClick={() => setLook({ ...look, accent: a })}
                  className={`h-14 w-14 rounded-full border-2 transition ${look.accent === a ? "border-onyx scale-110" : "border-transparent"}`}
                  style={{ background: a === "gold" ? "#c9a227" : a === "emerald" ? "#059669" : a === "blue" ? "#2563eb" : "#7c3aed" }} />
              ))}
            </div>
          </SettingsCard>
          <SettingsCard title={ta.settings.defaultLang}>
            <div className="flex gap-3">
              {(["fr", "en"] as Lang[]).map((l) => (
                <OptionCard key={l} selected={defaultLang === l} onClick={() => setDefaultLang(l)}
                  title={l === "fr" ? ta.settings.french : ta.settings.english} />
              ))}
            </div>
            {canEdit && (
              <Button className="mt-4" variant="outline" size="sm" onClick={async () => {
                await setSiteSetting("site_default_lang", { lang: defaultLang });
                setLang(defaultLang);
                toast.success(ta.common.saved);
              }}>{ta.common.save}</Button>
            )}
          </SettingsCard>
          {canEdit && <Button variant="hero" onClick={saveAppearance}>{ta.settings.saveAppearance}</Button>}
        </div>
      )}

      {section === "general" && (
        <SettingsCard title={ta.settings.hours}>
          <div className="space-y-3">
            {(["checkIn", "checkOut", "restaurant"] as const).map((k) => (
              <label key={k} className="block text-sm">
                <span className="text-muted-foreground capitalize">{k}</span>
                <input className="mt-1 w-full rounded-lg border px-3 py-2" value={hours[k]} disabled={!canEdit}
                  onChange={(e) => setHours((h) => ({ ...h, [k]: e.target.value }))} />
              </label>
            ))}
            <label className="block text-sm">
              <span className="text-muted-foreground">{ta.settings.cancellation}</span>
              <textarea className="mt-1 w-full rounded-lg border px-3 py-2" rows={3} value={hours.cancellationPolicy} disabled={!canEdit}
                onChange={(e) => setHours((h) => ({ ...h, cancellationPolicy: e.target.value }))} />
            </label>
          </div>
          {canEdit && (
            <Button className="mt-4" variant="hero" onClick={async () => {
              await setSiteSetting("hotel_settings", hours);
              toast.success(ta.common.saved);
            }}>{ta.common.save}</Button>
          )}
        </SettingsCard>
      )}

      {section === "enterprise" && (
        <SettingsCard title={ta.settings.enterpriseInfo}>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["name", "legalName", "address", "phone", "email", "currency", "timezone"] as const).map((k) => (
              <label key={k} className="block text-sm sm:col-span-2">
                <span className="capitalize text-muted-foreground">{k}</span>
                <input className="mt-1 w-full rounded-lg border px-3 py-2" value={ent[k]} disabled={!canEdit}
                  onChange={(e) => setEnt({ ...ent, [k]: e.target.value })} />
              </label>
            ))}
          </div>
          {canEdit && (
            <Button className="mt-4" variant="hero" onClick={async () => {
              await setSiteSetting("enterprise_settings", ent);
              toast.success(ta.common.saved);
            }}>{ta.common.save}</Button>
          )}
        </SettingsCard>
      )}

      {section === "accounting" && (
        <SettingsCard title={ta.settings.paymentMethods} description={ta.finance.subtitle}>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(payments) as (keyof PaymentSettings)[]).map((k) => (
              <label key={k} className="flex items-center gap-3 rounded-lg border border-border p-4 text-sm capitalize">
                <input type="checkbox" checked={payments[k]} disabled={!canEdit}
                  onChange={(e) => setPayments((p) => ({ ...p, [k]: e.target.checked }))} />
                {k}
              </label>
            ))}
          </div>
          {canEdit && (
            <Button className="mt-4" variant="hero" onClick={async () => {
              await setSiteSetting("payment_settings", payments);
              toast.success(ta.common.saved);
            }}>{ta.common.save}</Button>
          )}
        </SettingsCard>
      )}

      {section === "documents" && (
        <SettingsCard title={ta.settings.sections.documents} description={ta.settings.docsDesc}>
          <FileText className="mb-4 size-10 text-gold-deep" />
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">Préfixe facture</span>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={docs.invoicePrefix} disabled={!canEdit}
                onChange={(e) => setDocs({ ...docs, invoicePrefix: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Pied de page PDF</span>
              <textarea className="mt-1 w-full rounded-lg border px-3 py-2" rows={2} value={docs.footerText} disabled={!canEdit}
                onChange={(e) => setDocs({ ...docs, footerText: e.target.value })} />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={docs.showLogo} disabled={!canEdit}
                onChange={(e) => setDocs({ ...docs, showLogo: e.target.checked })} />
              Afficher le logo sur les documents
            </label>
          </div>
          {canEdit && (
            <Button className="mt-4" variant="hero" onClick={async () => {
              await setSiteSetting("document_settings", docs);
              toast.success(ta.common.saved);
            }}>{ta.common.save}</Button>
          )}
        </SettingsCard>
      )}

      {section === "notifications" && (
        <SettingsCard title={ta.settings.sections.notifications} description={ta.settings.notifDesc}>
          <Bell className="mb-4 size-10 text-gold-deep" />
          <div className="space-y-3">
            {([
              ["emailAlerts", "Alertes par email"],
              ["reservationNotify", "Nouvelles réservations"],
              ["lowStock", "Stock bas"],
              ["auditDigest", "Résumé audit hebdomadaire"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-lg border p-4 text-sm">
                <span>{label}</span>
                <input type="checkbox" checked={notif[key]} disabled={!canEdit}
                  onChange={(e) => setNotif({ ...notif, [key]: e.target.checked })} />
              </label>
            ))}
          </div>
          {canEdit && (
            <Button className="mt-4" variant="hero" onClick={async () => {
              await setSiteSetting("notification_settings", notif);
              toast.success(ta.common.saved);
            }}>{ta.common.save}</Button>
          )}
        </SettingsCard>
      )}

      {section === "email" && (
        <SettingsCard title={ta.settings.sections.email} description={ta.settings.smtpDesc}>
          <ul className="space-y-3 text-sm">
            {["RESEND_API_KEY", "EMAIL_FROM", "ADMIN_EMAIL", "VITE_SITE_URL"].map((v) => (
              <li key={v} className="rounded-lg border border-border bg-secondary/30 px-4 py-3 font-mono text-xs">{v}</li>
            ))}
          </ul>
        </SettingsCard>
      )}

      {section === "security" && (
        <SettingsCard title={ta.settings.sections.security} description={ta.settings.securityDesc}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { to: "/admin/roles", label: ta.nav.roles, Icon: Shield },
              { to: "/admin/activite", label: ta.nav.audit, Icon: Shield },
              { to: "/admin/surveillance", label: ta.nav.surveillance, Icon: Shield },
              { to: "/admin/utilisateurs", label: ta.nav.users, Icon: Shield },
            ].map(({ to, label }) => (
              <Button key={to} variant="outline" asChild><Link to={to as "/admin"}>{label}</Link></Button>
            ))}
          </div>
        </SettingsCard>
      )}

      {section === "backups" && (
        <SettingsCard title={ta.settings.sections.backups} description={ta.settings.backupDesc}>
          <Database className="mb-4 size-10 text-gold-deep" />
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Export CSV depuis Réservations, Clients, Finance, Audit</li>
            <li>• Sauvegarde Supabase automatique (plan Pro)</li>
            <li>• Historique git synchronisé avec Lovable</li>
          </ul>
          <Button className="mt-4" variant="outline" asChild><Link to="/admin/activite">{ta.nav.audit}</Link></Button>
        </SettingsCard>
      )}

      {section === "storage" && (
        <SettingsCard title={ta.settings.sections.storage} description={ta.settings.storageDesc}>
          <HardDrive className="mb-4 size-10 text-gold-deep" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4"><strong>gallery</strong><p className="text-xs text-muted-foreground">Médiathèque — 10 Mo, public</p></div>
            <div className="rounded-lg border p-4"><strong>room-photos</strong><p className="text-xs text-muted-foreground">Photos chambres — 5 Mo</p></div>
          </div>
          <Button className="mt-4" variant="outline" asChild><Link to="/admin/galerie">{ta.nav.media}</Link></Button>
        </SettingsCard>
      )}

      {section === "integrations" && (
        <SettingsCard title={ta.settings.sections.integrations}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: "Supabase", desc: "Base de données & auth" },
              { name: "CinetPay", desc: "Mobile Money" },
              { name: "Resend", desc: "Emails transactionnels" },
              { name: "Vercel", desc: "Hébergement production" },
            ].map((i) => (
              <div key={i.name} className="rounded-lg border p-4 shadow-sm">
                <strong>{i.name}</strong>
                <p className="text-sm text-muted-foreground">{i.desc}</p>
              </div>
            ))}
          </div>
        </SettingsCard>
      )}

      {section === "advanced" && (
        <SettingsCard title={ta.settings.sections.advanced} description={ta.settings.advancedDesc}>
          <Wrench className="mb-4 size-10 text-gold-deep" />
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-lg border p-4 text-sm">
              <span>Mode debug (logs console)</span>
              <input type="checkbox" checked={adv.debugMode} disabled={!canEdit}
                onChange={(e) => setAdv({ ...adv, debugMode: e.target.checked })} />
            </label>
            <label className="flex items-center justify-between rounded-lg border p-4 text-sm">
              <span>Mode maintenance (site public)</span>
              <input type="checkbox" checked={adv.maintenanceMode} disabled={!canEdit}
                onChange={(e) => setAdv({ ...adv, maintenanceMode: e.target.checked })} />
            </label>
          </div>
          {canEdit && (
            <Button className="mt-4" variant="hero" onClick={async () => {
              await setSiteSetting("advanced_settings", adv);
              toast.success(ta.common.saved);
            }}>{ta.common.save}</Button>
          )}
        </SettingsCard>
      )}
    </SettingsLayout>
  );
}
