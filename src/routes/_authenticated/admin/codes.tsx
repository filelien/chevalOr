import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import {
  fetchEntityCodes, fetchEntityCodeSequences, PREFIX_LABELS,
  qrCodeUrl, barcodeUrl, type EntityCodePrefix,
} from "@/lib/entity-codes";
import { brandedCodePrintHtml } from "@/lib/report-branding";
import { QrCode, ScanLine, Hash, Printer, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/codes")({
  component: EntityCodesPage,
});

const PREFIXES = Object.keys(PREFIX_LABELS) as EntityCodePrefix[];

function EntityCodesPage() {
  const [prefix, setPrefix] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["entity-codes", prefix, search],
    queryFn: () => fetchEntityCodes({
      prefix: prefix === "all" ? undefined : prefix,
      search: search || undefined,
      limit: 100,
    }),
  });

  const { data: sequences = [] } = useQuery({
    queryKey: ["entity-code-sequences"],
    queryFn: fetchEntityCodeSequences,
  });

  const totalCodes = codes.length;
  const lastSeq = sequences.reduce((max, s) => Math.max(max, s.last_value), 0);

  function printCode(code: string) {
    const win = window.open("", "_blank", "width=420,height=560");
    if (!win) return;
    win.document.write(brandedCodePrintHtml(code, qrCodeUrl(code, 180), barcodeUrl(code)));
    win.document.close();
    setTimeout(() => win.print(), 300);
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Administration · Traçabilité"
        title="Codes entités & QR"
        subtitle="Registre centralisé des codes séquentiels — chambres, tables, menus, réservations, commandes."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Codes enregistrés" value={totalCodes} Icon={Hash} accent />
        <StatCard label="Dernier numéro" value={lastSeq} Icon={ScanLine} />
        <StatCard label="Préfixes actifs" value={sequences.length} Icon={QrCode} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un code…"
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm"
            />
          </div>
          <select
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="rounded-lg border border-input bg-background px-4 py-2 text-sm"
          >
            <option value="all">Tous les préfixes</option>
            {PREFIXES.map((p) => (
              <option key={p} value={p}>{PREFIX_LABELS[p]} ({p})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-secondary/50" />
          ))
        ) : codes.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Aucun code trouvé. Les codes sont générés automatiquement à la création des entités.
          </div>
        ) : codes.map((row) => (
          <div
            key={row.id}
            className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md hover:border-gold/40"
          >
            <div className="bg-gradient-to-br from-gold-soft/30 to-transparent px-5 py-4">
              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-deep">
                {PREFIX_LABELS[row.prefix as EntityCodePrefix] ?? row.prefix}
              </span>
              <p className="mt-2 font-mono text-lg font-semibold tracking-wide">{row.code}</p>
              <p className="mt-1 text-xs text-muted-foreground">{row.entity_type}</p>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <img src={qrCodeUrl(row.code, 64)} alt="" className="size-16 rounded-lg border border-border/60" />
              <Button size="sm" variant="outline" onClick={() => printCode(row.code)}>
                <Printer className="mr-1 size-3.5" /> Imprimer
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl">Séquences par préfixe</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {sequences.map((s) => (
            <div key={s.prefix} className="flex items-center justify-between rounded-lg bg-secondary/40 px-4 py-3">
              <span className="font-mono text-sm font-medium">{s.prefix}</span>
              <span className="text-sm text-muted-foreground">
                {s.prefix}-{String(s.last_value).padStart(s.pad_length, "0")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
