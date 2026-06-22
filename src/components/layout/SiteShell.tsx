import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
<<<<<<< HEAD
import { I18nProvider } from "@/lib/i18n";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { PromoBanner } from "@/components/site/PromoBanner";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <PromoBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppButton />
      </div>
    </I18nProvider>
=======

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
  );
}