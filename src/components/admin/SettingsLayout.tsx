import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAdminI18n } from "@/hooks/use-admin-i18n";

export type SettingsSection = {
  id: string;
  labelKey: keyof ReturnType<typeof useAdminI18n>["ta"]["settings"]["sections"];
  groupKey: keyof ReturnType<typeof useAdminI18n>["ta"]["settings"]["groups"];
};

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: "general", labelKey: "general", groupKey: "system" },
  { id: "appearance", labelKey: "appearance", groupKey: "system" },
  { id: "enterprise", labelKey: "enterprise", groupKey: "system" },
  { id: "accounting", labelKey: "accounting", groupKey: "business" },
  { id: "documents", labelKey: "documents", groupKey: "business" },
  { id: "notifications", labelKey: "notifications", groupKey: "communication" },
  { id: "email", labelKey: "email", groupKey: "communication" },
  { id: "security", labelKey: "security", groupKey: "security" },
  { id: "backups", labelKey: "backups", groupKey: "security" },
  { id: "storage", labelKey: "storage", groupKey: "technical" },
  { id: "integrations", labelKey: "integrations", groupKey: "technical" },
  { id: "advanced", labelKey: "advanced", groupKey: "technical" },
];

type Props = {
  active: string;
  onChange: (id: string) => void;
  children: ReactNode;
  actions?: ReactNode;
};

export function SettingsLayout({ active, onChange, children, actions }: Props) {
  const { ta } = useAdminI18n();
  const groups = [...new Set(SETTINGS_SECTIONS.map((s) => s.groupKey))];

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">{ta.settings.system}</p>
          <h1 className="mt-1 font-display text-4xl">{ta.settings.title}</h1>
          <p className="mt-2 text-muted-foreground">{ta.settings.subtitle}</p>
        </div>
        {actions}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <nav className="settings-nav rounded-xl border border-border bg-card p-2 shadow-sm">
            {groups.map((group) => (
              <div key={group} className="mb-2">
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {ta.settings.groups[group]}
                </p>
                {SETTINGS_SECTIONS.filter((s) => s.groupKey === group).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onChange(s.id)}
                    className={cn(
                      "block w-full rounded-lg px-3 py-2.5 text-left text-sm transition",
                      active === s.id
                        ? "bg-onyx text-white font-medium shadow-sm"
                        : "text-foreground/80 hover:bg-secondary",
                    )}
                  >
                    {ta.settings.sections[s.labelKey]}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function SettingsCard({
  title, description, children,
}: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="settings-card rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-display text-xl">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function OptionCard({
  selected, onClick, title, subtitle, children,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "option-card flex flex-col items-center rounded-xl border-2 p-5 text-center transition hover:shadow-md",
        selected ? "border-gold-deep bg-gold-soft/30 ring-2 ring-gold-deep/20" : "border-border bg-card hover:border-gold/30",
      )}
    >
      {children}
      <p className="mt-3 font-medium">{title}</p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </button>
  );
}
