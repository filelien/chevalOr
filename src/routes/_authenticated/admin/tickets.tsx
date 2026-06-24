import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/tickets")({
  component: AdminTickets,
});

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  created_at: string;
};

const STATUS_LABEL = { open: "Ouvert", in_progress: "En cours", resolved: "Résolu", closed: "Fermé" };
const STATUS_STYLE = {
  open: "bg-amber-100 text-amber-800",
  in_progress: "bg-sky-100 text-sky-800",
  resolved: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-600",
};

function AdminTickets() {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" as const });

  const { data: tickets = [] } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "support_tickets").maybeSingle();
      return (data?.value ?? []) as Ticket[];
    },
  });

  async function createTicket() {
    if (!form.title.trim()) return;
    const ticket: Ticket = {
      id: crypto.randomUUID(),
      title: form.title,
      description: form.description,
      status: "open",
      priority: form.priority,
      created_at: new Date().toISOString(),
    };
    const next = [ticket, ...tickets];
    await supabase.from("site_settings").upsert({ key: "support_tickets", value: next, updated_at: new Date().toISOString() });
    toast.success("Ticket créé");
    setForm({ title: "", description: "", priority: "medium" });
    qc.invalidateQueries({ queryKey: ["admin-tickets"] });
  }

  async function updateStatus(id: string, status: Ticket["status"]) {
    const next = tickets.map((t) => (t.id === id ? { ...t, status } : t));
    await supabase.from("site_settings").upsert({ key: "support_tickets", value: next, updated_at: new Date().toISOString() });
    qc.invalidateQueries({ queryKey: ["admin-tickets"] });
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminPageHeader label="Administration" title="Tickets support" subtitle="Suivi des demandes internes et incidents système." />

      {hasPermission("message.manage") && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h2 className="font-display text-lg">Nouveau ticket</h2>
          <input className="w-full rounded-md border px-3 py-2" placeholder="Sujet" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="w-full rounded-md border px-3 py-2" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className="rounded-md border px-3 py-2 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Ticket["priority"] })}>
            <option value="low">Basse</option><option value="medium">Moyenne</option><option value="high">Haute</option>
          </select>
          <Button variant="hero" onClick={createTicket}><Plus className="mr-1 size-4" />Créer</Button>
        </div>
      )}

      <div className="space-y-3">
        {tickets.length === 0 ? (
          <p className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">Aucun ticket.</p>
        ) : tickets.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("fr-FR")}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-1 text-xs ${STATUS_STYLE[t.status]}`}>{STATUS_LABEL[t.status]}</span>
                {hasPermission("message.manage") && t.status !== "closed" && (
                  <select className="rounded-md border px-2 py-1 text-xs" value={t.status} onChange={(e) => updateStatus(t.id, e.target.value as Ticket["status"])}>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
