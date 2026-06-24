import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { I18nProvider } from "@/lib/i18n";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppButton />
      </div>
    </I18nProvider>
  );
}