import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";

type SearchResult = {
  id: string;
  type: "reservation" | "client" | "room" | "message" | "invoice";
  label: string;
  sub: string;
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
};

async function globalSearch(q: string): Promise<SearchResult[]> {
  if (!q.trim() || q.length < 2) return [];
  const term = `%${q.trim()}%`;
  const [res, profilesByName, profilesByEmail, roomsRes, messagesRes] = await Promise.all([
    supabase.from("reservations").select("id, reference, profiles(full_name)").ilike("reference", term).limit(5),
    supabase.from("profiles").select("id, full_name, email").ilike("full_name", term).limit(5),
    supabase.from("profiles").select("id, full_name, email").ilike("email", term).limit(5),
    supabase.from("rooms").select("id, number, name").ilike("name", term).limit(5),
    supabase.from("contact_messages").select("id, full_name, subject").ilike("full_name", term).limit(5),
  ]);
  const profileIds = new Set<string>();
  const profileList = [...(profilesByName.data ?? []), ...(profilesByEmail.data ?? [])].filter((p) => {
    if (profileIds.has(p.id)) return false;
    profileIds.add(p.id);
    return true;
  });

  const results: SearchResult[] = [];
  for (const r of res.data ?? []) {
    results.push({
      id: r.id,
      type: "reservation",
      label: r.reference ?? "Réservation",
      sub: (r.profiles as { full_name?: string } | null)?.full_name ?? "",
      to: "/admin/reservations",
      search: { q: r.reference ?? "" },
    });
  }
  for (const p of profileList) {
    results.push({
      id: p.id,
      type: "client",
      label: p.full_name ?? p.email ?? "Client",
      sub: p.email ?? "",
      to: "/admin/clients/$id",
      params: { id: p.id },
    });
  }
  for (const room of roomsRes.data ?? []) {
    results.push({
      id: room.id,
      type: "room",
      label: `Chambre ${room.number}`,
      sub: room.name ?? "",
      to: "/admin/chambres",
    });
  }
  for (const m of messagesRes.data ?? []) {
    results.push({
      id: m.id,
      type: "message",
      label: m.subject ?? "Message",
      sub: m.full_name ?? "",
      to: "/admin/messages",
    });
  }
  return results;
}

const TYPE_LABEL: Record<SearchResult["type"], string> = {
  reservation: "Réservation",
  client: "Client",
  room: "Chambre",
  message: "Message",
  invoice: "Facture",
};

export function AdminGlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const runSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      setResults(await globalSearch(q));
    } finally {
      setLoading(false);
    }
  }, []);

  function goTo(r: SearchResult) {
    setOpen(false);
    if (r.params) {
      navigate({ to: r.to as "/admin/clients/$id", params: r.params as { id: string }, search: r.search });
    } else {
      navigate({ to: r.to as "/admin", search: r.search });
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Recherche globale…</span>
        <kbd className="hidden rounded border border-white/20 px-1.5 text-[10px] md:inline">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Client, réservation, chambre, message…" value={query} onValueChange={runSearch} />
        <CommandList>
          <CommandEmpty>{loading ? "Recherche…" : query.length < 2 ? "Tapez au moins 2 caractères" : "Aucun résultat"}</CommandEmpty>
          {results.length > 0 && (
            <>
              <CommandGroup heading="Résultats">
                {results.map((r) => (
                  <CommandItem key={`${r.type}-${r.id}`} onSelect={() => goTo(r)}>
                    <span className="font-medium">{r.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{TYPE_LABEL[r.type]} · {r.sub}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Raccourcis">
                <CommandItem onSelect={() => { setOpen(false); navigate({ to: "/admin/reservations" }); }}>Réservations</CommandItem>
                <CommandItem onSelect={() => { setOpen(false); navigate({ to: "/admin/clients" }); }}>Clients CRM</CommandItem>
                <CommandItem onSelect={() => { setOpen(false); navigate({ to: "/admin/activite" }); }}>Journal d'audit</CommandItem>
                <CommandItem onSelect={() => { setOpen(false); navigate({ to: "/admin/roles" }); }}>Rôles & permissions</CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
