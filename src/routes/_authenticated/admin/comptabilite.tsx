import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
import { AdminModuleLayout } from "@/components/admin/AdminModuleLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useAdminI18n } from "@/hooks/use-admin-i18n";
import {
  fetchChartOfAccounts,
  generateTrialBalance,
  generateIncomeStatement,
  generateVatReturn,
  fetchJournalEntries,
} from "@/lib/professional-accounting";
import { downloadCsv } from "@/lib/export-csv";
import { printAccountingReport } from "@/lib/report-branding";
import { HotelLogo } from "@/components/brand/HotelLogo";
import { BookOpen, TrendingUp, BarChart3, Receipt, Download, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/comptabilite")({
  component: AdminAccounting,
});

function AdminAccounting() {
  const { ta } = useAdminI18n();
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const [tab, setTab] = useState<"accounts" | "journal" | "reports">("accounts");
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "quarter" | "year">("month");

  const { data: accounts = [] } = useQuery({
    queryKey: ["chart-accounts"],
    queryFn: fetchChartOfAccounts,
    enabled: hasPermission("finance.view"),
  });

  const { data: trialBalance = [] } = useQuery({
    queryKey: ["trial-balance"],
    queryFn: () => generateTrialBalance(),
    enabled: hasPermission("finance.view") && tab === "reports",
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: () => fetchJournalEntries({ status: "posted" }),
    enabled: hasPermission("finance.view") && tab === "journal",
  });

  const { data: incomeStatement } = useQuery({
    queryKey: ["income-statement", selectedPeriod],
    queryFn: async () => {
      const now = new Date();
      let from: string, to: string;

      if (selectedPeriod === "month") {
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      } else if (selectedPeriod === "quarter") {
        const quarter = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), quarter * 3, 1).toISOString();
        to = new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString();
      } else {
        from = new Date(now.getFullYear(), 0, 1).toISOString();
        to = new Date(now.getFullYear(), 11, 31).toISOString();
      }

      return generateIncomeStatement(from, to);
    },
    enabled: hasPermission("finance.view") && tab === "reports",
  });

  const stats = useMemo(() => {
    const totalAssets = trialBalance
      .filter((b) => b.type === "asset")
      .reduce((sum, b) => sum + b.debit_balance, 0);

    const totalLiabilities = trialBalance
      .filter((b) => b.type === "liability")
      .reduce((sum, b) => sum + b.credit_balance, 0);

    const totalEquity = trialBalance
      .filter((b) => b.type === "equity")
      .reduce((sum, b) => sum + b.credit_balance, 0);

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      netIncome: incomeStatement?.net_income || 0,
    };
  }, [trialBalance, incomeStatement]);

  async function exportReport() {
    if (tab === "accounts") {
      const data = accounts.map((a) => ({
        Code: a.code,
        "Nom du compte": a.name,
        Type: a.type,
        Catégorie: a.category,
        Actif: a.is_active ? "Oui" : "Non",
      }));
      downloadCsv(data, "plan-comptable.csv");
    } else if (tab === "reports" && trialBalance.length > 0) {
      const data = trialBalance.map((b) => ({
        "Code Compte": b.account_code,
        "Nom": b.account_name,
        "Type": b.type,
        "Solde Débit": b.debit_balance,
        "Solde Crédit": b.credit_balance,
        "Solde Total": b.total_balance,
      }));
      downloadCsv(data, "balance-verification.csv");
    }
    toast.success("Export réussi");
  }

  return (
    <AdminModuleLayout>
      <AdminPageHeader
        label="Finance"
        title="Comptabilité Professionnelle"
        subtitle="Plan comptable, écritures, balance, comptes de résultat"
      >
        <Button variant="outline" size="sm" onClick={exportReport}>
          <Download className="mr-1 size-4" />
          Exporter
        </Button>
      </AdminPageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Actif Total" value={`${(stats.totalAssets / 1000000).toFixed(2)}M XOF`} Icon={TrendingUp} />
        <StatCard label="Passif Total" value={`${(stats.totalLiabilities / 1000000).toFixed(2)}M XOF`} Icon={BarChart3} />
        <StatCard label="Capitaux Propres" value={`${(stats.totalEquity / 1000000).toFixed(2)}M XOF`} Icon={BookOpen} />
        <StatCard label="Résultat Net" value={`${(stats.netIncome / 1000000).toFixed(2)}M XOF`} Icon={Receipt} accent />
      </div>

      {/* Tabs */}
      <div className="mt-8 space-y-4">
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setTab("accounts")}
            className={`px-4 py-2 ${tab === "accounts" ? "border-b-2 border-gold text-gold font-medium" : "text-muted-foreground"}`}
          >
            Plan Comptable
          </button>
          <button
            onClick={() => setTab("journal")}
            className={`px-4 py-2 ${tab === "journal" ? "border-b-2 border-gold text-gold font-medium" : "text-muted-foreground"}`}
          >
            Journal
          </button>
          <button
            onClick={() => setTab("reports")}
            className={`px-4 py-2 ${tab === "reports" ? "border-b-2 border-gold text-gold font-medium" : "text-muted-foreground"}`}
          >
            Rapports
          </button>
        </div>

        {/* Plan Comptable Tab */}
        {tab === "accounts" && (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Code</th>
                  <th className="px-4 py-2 text-left">Nom</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Catégorie</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-2 font-mono">{a.code}</td>
                    <td className="px-4 py-2">{a.name}</td>
                    <td className="px-4 py-2 text-xs uppercase text-muted-foreground">{a.type}</td>
                    <td className="px-4 py-2">{a.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Journal Tab */}
        {tab === "journal" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{journalEntries.length} écritures postées</p>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">N° Écriture</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-right">Débit</th>
                    <th className="px-4 py-2 text-right">Crédit</th>
                  </tr>
                </thead>
                <tbody>
                  {journalEntries.map((e: any) => (
                    <tr key={e.id} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-2">{new Date(e.entry_date).toLocaleDateString("fr-FR")}</td>
                      <td className="px-4 py-2 font-mono text-xs">{e.entry_number}</td>
                      <td className="px-4 py-2">{e.description}</td>
                      <td className="px-4 py-2 text-right">{(e.total_debit || 0).toLocaleString("fr-FR")}</td>
                      <td className="px-4 py-2 text-right">{(e.total_credit || 0).toLocaleString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {tab === "reports" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-gradient-to-r from-[#faf8f4] to-white p-6">
              <HotelLogo size="lg" tone="light" wrap />
              <Button
                variant="outline"
                size="sm"
                onClick={() => printAccountingReport({
                  title: "Balance de vérification",
                  subtitle: selectedPeriod === "month" ? "Période : mois en cours" : selectedPeriod === "quarter" ? "Période : trimestre en cours" : "Période : année en cours",
                  rows: trialBalance.map((b: any) => ({
                    label: b.account_name,
                    debit: (b.debit_balance || 0).toLocaleString("fr-FR"),
                    credit: (b.credit_balance || 0).toLocaleString("fr-FR"),
                  })),
                  summary: incomeStatement ? [
                    { label: "Produits", value: `${(incomeStatement.total_revenue / 1000000).toFixed(2)}M XOF` },
                    { label: "Charges", value: `-${(incomeStatement.total_expenses / 1000000).toFixed(2)}M XOF` },
                    { label: "Résultat net", value: `${(incomeStatement.net_income / 1000000).toFixed(2)}M XOF` },
                  ] : undefined,
                })}
                disabled={!trialBalance.length}
              >
                <Printer className="mr-1 size-4" />Imprimer
              </Button>
            </div>

            <div className="flex gap-2">
              {(["month", "quarter", "year"] as const).map((p) => (
                <Button
                  key={p}
                  variant={selectedPeriod === p ? "hero" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(p)}
                >
                  {p === "month" ? "Mois" : p === "quarter" ? "Trimestre" : "Année"}
                </Button>
              ))}
            </div>

            {/* Balance de Vérification */}
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Balance de Vérification</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Compte</th>
                      <th className="px-4 py-2 text-right">Débit</th>
                      <th className="px-4 py-2 text-right">Crédit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trialBalance.map((b: any) => (
                      <tr key={b.account_code} className="border-b">
                        <td className="px-4 py-2">{b.account_name}</td>
                        <td className="px-4 py-2 text-right">{(b.debit_balance || 0).toLocaleString("fr-FR")}</td>
                        <td className="px-4 py-2 text-right">{(b.credit_balance || 0).toLocaleString("fr-FR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Income Statement */}
            {incomeStatement && (
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Compte de Résultat</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Produits</p>
                    <p className="text-2xl font-bold">{(incomeStatement.total_revenue / 1000000).toFixed(2)}M XOF</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Charges</p>
                    <p className="text-2xl font-bold text-red-600">-{(incomeStatement.total_expenses / 1000000).toFixed(2)}M XOF</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">Résultat Net</p>
                    <p className={`text-2xl font-bold ${incomeStatement.net_income >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {(incomeStatement.net_income / 1000000).toFixed(2)}M XOF
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminModuleLayout>
  );
}
