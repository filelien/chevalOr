/**
 * Professional Accounting System (Comptabilité Professionnelle)
 * Plan comptable complet, écritures, GL, balance, journaux, bilan, TVA, etc.
 */

import { supabase } from "@/integrations/supabase/client";

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";
export type JournalType = "VE" | "AC" | "BA" | "TR" | "OP"; // Ventes, Achats, Banque, Trésor, Opérations diverses

// Plan comptable (Chart of Accounts)
export type ChartAccount = {
  id: string;
  code: string; // Numéro de compte (ex: 411001)
  name: string; // Libellé du compte
  type: AccountType;
  category: string; // Catégorie (ex: "Clients", "Fournisseurs")
  balance?: number;
  currency: string;
  is_active: boolean;
  created_at: string;
};

// Écritures comptables (Journal entries)
export type JournalEntry = {
  id: string;
  entry_number: string; // Numéro séquentiel (JV-2026-001)
  journal_type: JournalType;
  entry_date: string;
  description: string;
  reference?: string; // Invoice/receipt number
  total_debit: number;
  total_credit: number;
  status: "draft" | "posted" | "cancelled";
  posted_by?: string;
  posted_at?: string;
  created_by: string;
  created_at: string;
  lines: JournalLine[];
};

export type JournalLine = {
  id: string;
  entry_id: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  description?: string;
};

// Grand Livre (General Ledger)
export type LedgerEntry = {
  date: string;
  entry_number: string;
  description: string;
  reference?: string;
  debit: number;
  credit: number;
  balance: number;
};

// Balance (Trial Balance)
export type TrialBalance = {
  account_code: string;
  account_name: string;
  type: AccountType;
  debit_balance: number;
  credit_balance: number;
  total_balance: number;
};

// Income Statement (Compte de Résultat)
export type IncomeStatement = {
  period_from: string;
  period_to: string;
  revenues: { label: string; amount: number }[];
  total_revenue: number;
  expenses: { label: string; amount: number }[];
  total_expenses: number;
  gross_profit: number;
  operating_income: number;
  net_income: number;
};

// Balance Sheet (Bilan)
export type BalanceSheet = {
  date: string;
  assets: { label: string; amount: number }[];
  total_assets: number;
  liabilities: { label: string; amount: number }[];
  total_liabilities: number;
  equity: { label: string; amount: number }[];
  total_equity: number;
};

// TVA (VAT)
export type VatReturn = {
  id: string;
  period: string; // "2026-Q1"
  vat_collected: number; // TVA facturée
  vat_deductible: number; // TVA déductible
  vat_due: number; // TVA à payer
  created_at: string;
};

const DEFAULT_CHART_OF_ACCOUNTS: Omit<ChartAccount, "id" | "created_at">[] = [
  // ASSETS (Actif)
  { code: "100001", name: "Banque", type: "asset", category: "Trésorerie", currency: "XOF", is_active: true },
  { code: "100002", name: "Caisse", type: "asset", category: "Trésorerie", currency: "XOF", is_active: true },
  { code: "110001", name: "Clients", type: "asset", category: "Clients", currency: "XOF", is_active: true },
  { code: "120001", name: "Stocks", type: "asset", category: "Inventaire", currency: "XOF", is_active: true },

  // LIABILITIES (Passif)
  { code: "200001", name: "Fournisseurs", type: "liability", category: "Fournisseurs", currency: "XOF", is_active: true },
  { code: "210001", name: "TVA à payer", type: "liability", category: "TVA", currency: "XOF", is_active: true },
  { code: "210002", name: "TVA déductible", type: "liability", category: "TVA", currency: "XOF", is_active: true },

  // EQUITY (Capitaux propres)
  { code: "300001", name: "Capital Social", type: "equity", category: "Capital", currency: "XOF", is_active: true },
  { code: "310001", name: "Résultats antérieurs", type: "equity", category: "Résultats", currency: "XOF", is_active: true },

  // REVENUE (Produits)
  { code: "400001", name: "Revenu hôtel", type: "revenue", category: "Hôtel", currency: "XOF", is_active: true },
  { code: "400002", name: "Revenu restaurant", type: "revenue", category: "Restaurant", currency: "XOF", is_active: true },
  { code: "400003", name: "Revenu conférence", type: "revenue", category: "Événements", currency: "XOF", is_active: true },

  // EXPENSES (Charges)
  { code: "600001", name: "Salaires", type: "expense", category: "Personnel", currency: "XOF", is_active: true },
  { code: "600002", name: "Électricité", type: "expense", category: "Services", currency: "XOF", is_active: true },
  { code: "600003", name: "Eau", type: "expense", category: "Services", currency: "XOF", is_active: true },
  { code: "600004", name: "Maintenance", type: "expense", category: "Entretien", currency: "XOF", is_active: true },
  { code: "600005", name: "Approvisionnement", type: "expense", category: "Achats", currency: "XOF", is_active: true },
];

/**
 * Récupère le plan comptable complet
 */
export async function fetchChartOfAccounts(): Promise<ChartAccount[]> {
  try {
    const { data, error } = await supabase
      .from("chart_of_accounts")
      .select("*")
      .eq("is_active", true)
      .order("code");

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error("[accounting] Erreur chart:", err);
    return [];
  }
}

/**
 * Crée une nouvelle écriture comptable
 */
export async function createJournalEntry(entry: Omit<JournalEntry, "id" | "created_at" | "lines">): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        entry_number: entry.entry_number,
        journal_type: entry.journal_type,
        entry_date: entry.entry_date,
        description: entry.description,
        reference: entry.reference,
        total_debit: entry.total_debit,
        total_credit: entry.total_credit,
        status: entry.status || "draft",
        created_by: entry.created_by,
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  } catch (err) {
    console.error("[accounting] Erreur création écriture:", err);
    throw err;
  }
}

/**
 * Ajoute une ligne à une écriture
 */
export async function addJournalLine(line: Omit<JournalLine, "id">): Promise<void> {
  try {
    const { error } = await supabase.from("journal_lines").insert(line);
    if (error) throw error;
  } catch (err) {
    console.error("[accounting] Erreur ligne:", err);
    throw err;
  }
}

/**
 * Poste une écriture (passage de draft à posted)
 */
export async function postJournalEntry(entryId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("journal_entries")
      .update({ status: "posted", posted_by: userId, posted_at: new Date().toISOString() })
      .eq("id", entryId);

    if (error) throw error;
  } catch (err) {
    console.error("[accounting] Erreur posting:", err);
    throw err;
  }
}

/**
 * Récupère le grand livre pour un compte
 */
export async function fetchGeneralLedger(
  accountCode: string,
  fromDate?: string,
  toDate?: string
): Promise<LedgerEntry[]> {
  try {
    let query = supabase.from("journal_lines")
      .select("jl.*, je.entry_date, je.entry_number, je.description, je.reference")
      .eq("jl.account_code", accountCode)
      .eq("je.status", "posted");

    if (fromDate) query = query.gte("je.entry_date", fromDate);
    if (toDate) query = query.lte("je.entry_date", toDate);

    const { data, error } = await query.order("je.entry_date", { ascending: true });
    if (error) throw error;

    let runningBalance = 0;
    return (data ?? []).map((row: any) => {
      runningBalance += (row.debit || 0) - (row.credit || 0);
      return {
        date: row.entry_date,
        entry_number: row.entry_number,
        description: row.description,
        reference: row.reference,
        debit: row.debit || 0,
        credit: row.credit || 0,
        balance: runningBalance,
      };
    });
  } catch (err) {
    console.error("[accounting] Erreur GL:", err);
    return [];
  }
}

/**
 * Génère une balance de vérification (Trial Balance)
 */
export async function generateTrialBalance(asOfDate?: string): Promise<TrialBalance[]> {
  try {
    const { data: accounts, error: accountError } = await supabase
      .from("chart_of_accounts")
      .select("*");

    if (accountError) throw accountError;

    const balances: TrialBalance[] = [];

    for (const account of accounts ?? []) {
      const { data: lines } = await supabase
        .from("journal_lines")
        .select("debit, credit")
        .eq("account_code", account.code)
        .lte("created_at", asOfDate || new Date().toISOString());

      const totalDebit = (lines ?? []).reduce((sum, l: any) => sum + (l.debit || 0), 0);
      const totalCredit = (lines ?? []).reduce((sum, l: any) => sum + (l.credit || 0), 0);

      let debitBalance = 0,
        creditBalance = 0;
      if (account.type === "asset" || account.type === "expense") {
        debitBalance = totalDebit - totalCredit;
      } else {
        creditBalance = totalCredit - totalDebit;
      }

      if (debitBalance !== 0 || creditBalance !== 0) {
        balances.push({
          account_code: account.code,
          account_name: account.name,
          type: account.type,
          debit_balance: Math.max(0, debitBalance),
          credit_balance: Math.max(0, creditBalance),
          total_balance: debitBalance - creditBalance,
        });
      }
    }

    return balances;
  } catch (err) {
    console.error("[accounting] Erreur trial balance:", err);
    return [];
  }
}

/**
 * Génère un compte de résultat (Income Statement)
 */
export async function generateIncomeStatement(fromDate: string, toDate: string): Promise<IncomeStatement> {
  try {
    const { data: lines } = await supabase
      .from("journal_lines")
      .select("account_code, account_name, debit, credit, je.entry_date")
      .gte("je.entry_date", fromDate)
      .lte("je.entry_date", toDate)
      .eq("je.status", "posted");

    const revenues: Record<string, number> = {};
    const expenses: Record<string, number> = {};

    (lines ?? []).forEach((line: any) => {
      if (line.account_code.startsWith("4")) {
        // Revenue
        revenues[line.account_name] = (revenues[line.account_name] || 0) + (line.credit || 0);
      } else if (line.account_code.startsWith("6")) {
        // Expense
        expenses[line.account_name] = (expenses[line.account_name] || 0) + (line.debit || 0);
      }
    });

    const totalRevenue = Object.values(revenues).reduce((a, b) => a + b, 0);
    const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);

    return {
      period_from: fromDate,
      period_to: toDate,
      revenues: Object.entries(revenues).map(([label, amount]) => ({ label, amount })),
      total_revenue: totalRevenue,
      expenses: Object.entries(expenses).map(([label, amount]) => ({ label, amount })),
      total_expenses: totalExpenses,
      gross_profit: totalRevenue - totalExpenses,
      operating_income: totalRevenue - totalExpenses,
      net_income: totalRevenue - totalExpenses,
    };
  } catch (err) {
    console.error("[accounting] Erreur P&L:", err);
    return {
      period_from: fromDate,
      period_to: toDate,
      revenues: [],
      total_revenue: 0,
      expenses: [],
      total_expenses: 0,
      gross_profit: 0,
      operating_income: 0,
      net_income: 0,
    };
  }
}

/**
 * Calcule la TVA pour une période
 */
export async function calculateVatReturn(period: string): Promise<VatReturn> {
  try {
    // TVA facturée: comptes revenue * taux (assume 18%)
    const { data: salesLines } = await supabase
      .from("journal_lines")
      .select("credit")
      .eq("account_code", "400001")
      .like("created_at", `${period}%`);

    // TVA déductible: comptes expense * taux
    const { data: expenseLines } = await supabase
      .from("journal_lines")
      .select("debit")
      .eq("account_code", "600005")
      .like("created_at", `${period}%`);

    const VAT_RATE = 0.18;
    const salesTotal = (salesLines ?? []).reduce((s, l: any) => s + (l.credit || 0), 0);
    const expenseTotal = (expenseLines ?? []).reduce((s, l: any) => s + (l.debit || 0), 0);

    const vatCollected = salesTotal * VAT_RATE;
    const vatDeductible = expenseTotal * VAT_RATE;
    const vatDue = vatCollected - vatDeductible;

    return {
      id: `VAT-${period}`,
      period,
      vat_collected: vatCollected,
      vat_deductible: vatDeductible,
      vat_due: Math.max(0, vatDue),
    };
  } catch (err) {
    console.error("[accounting] Erreur VAT:", err);
    return {
      id: `VAT-${period}`,
      period,
      vat_collected: 0,
      vat_deductible: 0,
      vat_due: 0,
    };
  }
}

/**
 * Récupère journal entries avec filtres
 */
export async function fetchJournalEntries(filters?: {
  journal_type?: JournalType;
  status?: "draft" | "posted" | "cancelled";
  from_date?: string;
  to_date?: string;
}): Promise<JournalEntry[]> {
  try {
    let query = supabase.from("journal_entries").select("*");

    if (filters?.journal_type) query = query.eq("journal_type", filters.journal_type);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.from_date) query = query.gte("entry_date", filters.from_date);
    if (filters?.to_date) query = query.lte("entry_date", filters.to_date);

    const { data, error } = await query.order("entry_date", { ascending: false });

    if (error) throw error;
    return (data ?? []) as JournalEntry[];
  } catch (err) {
    console.error("[accounting] Erreur journal entries:", err);
    return [];
  }
}
