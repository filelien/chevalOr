import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/galerie")({
  component: AdminGallery,
});

function AdminGallery() {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Site web · Médias"
        title="Médiathèque"
        subtitle="Bibliothèque centralisée : uploadez, classez et réutilisez vos photos sur le site, le CMS et le SEO."
      >
        <Button variant="outline" size="sm" asChild>
          <a href="/galerie" target="_blank" rel="noreferrer">
            <ExternalLink className="mr-1 size-4" />Voir la galerie publique
          </a>
        </Button>
      </AdminPageHeader>
      <MediaLibrary />
    </div>
  );
}
