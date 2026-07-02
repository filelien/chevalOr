import { supabase } from "@/integrations/supabase/client";

export type JournalType = "sales" | "purchase" | "bank" | "general";
export type EntryStatus = "draft" | "posted" | "cancelled" | "archived";
export type FinanceRecordType = "income" | "expense";

export type AccountingEntry = {
  id: string;
  journal_type: JournalType;
  date: string;
  reference: string;
  description: string;
  line_amount: number;
  debit: number;
  credit: number;
  account_code: string;
  status: EntryStatus;
  posted_by?: string;
  posted_at?: string;
  created_at: string;
  updated_at: string;
};

export type FinanceSummary = {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  byCategory: Array<{ category: string; amount: number; type: FinanceRecordType }>;
  byMonth: Array<{ month: string; income: number; expenses: number }>;
};

export const JOURNAL_LABELS: Record<JournalType, string> = {
  sales: "Ventes",
  purchase: "Achats",
  bank: "Banque",
  general: "Général",
};

export const ENTRY_STATUS_LABEL: Record<EntryStatus, string> = {
  draft: "Brouillon",
  posted: "Enregistrée",
  cancelled: "Annulée",
  archived: "Archivée",
};

export const ENTRY_STATUS_BADGE: Record<EntryStatus, string> = {
  draft: "bg-slate-100 text-slate-800",
  posted: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  archived: "bg-gray-100 text-gray-800",
};

/** Enregistre une écriture comptable. */
export async function postAccountingEntry(entry: Omit<AccountingEntry, "id" | "created_at" | "updated_at">) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("accounting_entries").insert({
    ...entry,
    posted_by: user?.id ?? null,
    posted_at: entry.status === "posted" ? new Date().toISOString() : null,
  });
  if (error) throw error;
}

/** Récupère toutes les écritures comptables. */
export async function fetchAccountingEntries() {
  const { data, error } = await supabase
    .from("accounting_entries")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AccountingEntry[];
}

/** Récupère les écritures filtrées. */
export async function fetchAccountingEntriesFiltered(filters: {
  journal?: JournalType;
  status?: EntryStatus;
  fromDate?: string;
  toDate?: string;
}) {
  let q = supabase.from("accounting_entries").select("*");

  if (filters.journal) q = q.eq("journal_type", filters.journal);
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.fromDate) q = q.gte("date", filters.fromDate);
  if (filters.toDate) q = q.lte("date", filters.toDate);

  const { data, error } = await q.order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AccountingEntry[];
}

/** Récupère un résumé financier. */
export async function fetchFinanceSummary(fromDate?: string, toDate?: string): Promise<FinanceSummary> {
  let q = supabase.from("financial_records").select("*");
  if (fromDate) q = q.gte("record_date", fromDate);
  if (toDate) q = q.lte("record_date", toDate);

  const { data, error } = await q.order("record_date");
  if (error) throw error;

  const records = (data ?? []) as Array<{ type: FinanceRecordType; amount: number; category: string; record_date: string }>;

  const totalIncome = records.filter((r) => r.type === "income").reduce((s, r) => s + Number(r.amount ?? 0), 0);
  const totalExpenses = records.filter((r) => r.type === "expense").reduce((s, r) => s + Number(r.amount ?? 0), 0);
  const netProfit = totalIncome - totalExpenses;

  const byCategory = Object.entries(
    records.reduce((acc, r) => {
      const key = `${r.category}|${r.type}`;
      acc[key] = (acc[key] ?? 0) + Number(r.amount ?? 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([key, amount]) => {
    const [category, type] = key.split("|");
    return { category, amount, type: type as FinanceRecordType };
  });

  const byMonth = Object.entries(
    records.reduce((acc, r) => {
      const month = r.record_date.slice(0, 7);
      if (!acc[month]) acc[month] = { income: 0, expenses: 0 };
      if (r.type === "income") acc[month].income += Number(r.amount ?? 0);
      else acc[month].expenses += Number(r.amount ?? 0);
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>)
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({ month, ...values }));

  return { totalIncome, totalExpenses, netProfit, byCategory, byMonth };
}

/** Crée ou met à jour un enregistrement financier. */
export async function upsertFinancialRecord(
  id: string | null,
  record: {
    amount: number;
    category: string;
    type: FinanceRecordType;
    record_date: string;
    description?: string;
    source?: string;
  }
) {
  const payload = {
    amount: record.amount,
    category: record.category,
    type: record.type,
    record_date: record.record_date,
    description: record.description ?? null,
    source: record.source ?? null,
  };

  if (id) {
    const { error } = await supabase.from("financial_records").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("financial_records").insert(payload);
    if (error) throw error;
  }
}

/** Supprime un enregistrement financier. */
export async function deleteFinancialRecord(id: string) {
  const { error } = await supabase.from("financial_records").delete().eq("id", id);
  if (error) throw error;
}

/** Archive une écriture comptable. */
export async function archiveAccountingEntry(id: string) {
  const { error } = await supabase
    .from("accounting_entries")
    .update({ status: "archived" })
    .eq("id", id);
  if (error) throw error;
}

/** Annule une écriture comptable. */
export async function cancelAccountingEntry(id: string) {
  const { error } = await supabase
    .from("accounting_entries")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw error;
}

/** Valide (enregistre) une écriture comptable. */
export async function validateAccountingEntry(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("accounting_entries")
    .update({
      status: "posted",
      posted_by: user?.id ?? null,
      posted_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}
