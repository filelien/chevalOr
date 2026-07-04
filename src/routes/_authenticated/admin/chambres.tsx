import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { fetchAllRooms, ROOM_STATUS_BADGE, ROOM_STATUS_LABEL, ROOM_TYPE_LABEL, type RoomWithPhotos, formatXOF } from "@/lib/rooms";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { EditableImage } from "@/components/admin/media/EditableImage";
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/chambres")({
  component: AdminRoomsPage,
});

type Draft = {
  id?: string;
  number: string;
  name: string;
  type: RoomWithPhotos["type"];
  capacity: number;
  price_per_night: number;
  description: string;
  amenities: string;
  size_sqm: number | "";
  status: RoomWithPhotos["status"];
  is_active: boolean;
};

const empty: Draft = { number: "", name: "", type: "standard", capacity: 2, price_per_night: 50000, description: "", amenities: "", size_sqm: "", status: "available", is_active: true };

function AdminRoomsPage() {
  const qc = useQueryClient();
  const { hasAnyRole } = useAuth();
  const canEdit = hasAnyRole(["super_admin", "manager"]);
  const [editor, setEditor] = useState<Draft | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: rooms, isLoading } = useQuery({ queryKey: ["admin-rooms"], queryFn: fetchAllRooms });

  const upsert = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        number: d.number, name: d.name, type: d.type, capacity: d.capacity,
        price_per_night: d.price_per_night, description: d.description,
        amenities: d.amenities.split(",").map((s) => s.trim()).filter(Boolean),
        size_sqm: d.size_sqm === "" ? null : Number(d.size_sqm),
        status: d.status, is_active: d.is_active,
      };
      if (d.id) {
        const { error } = await supabase.from("rooms").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rooms").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Chambre enregistrée"); qc.invalidateQueries({ queryKey: ["admin-rooms"] }); qc.invalidateQueries({ queryKey: ["public-rooms"] }); setEditor(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Chambre supprimée"); qc.invalidateQueries({ queryKey: ["admin-rooms"] }); qc.invalidateQueries({ queryKey: ["public-rooms"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const changeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RoomWithPhotos["status"] }) => {
      const { error } = await supabase.from("rooms").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-rooms"] }); qc.invalidateQueries({ queryKey: ["public-rooms"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (rooms ?? []).filter((r) => {
    const q = search.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.number.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || r.status === statusFilter;
    return matchQ && matchS;
  });

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Gestion</span>
          <h1 className="mt-2 font-display text-4xl">Chambres</h1>
        </div>
        {canEdit && (
          <Button variant="hero" onClick={() => setEditor(empty)}>
            <Plus className="size-4" /> Nouvelle chambre
          </Button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          placeholder="Rechercher (nom, n°)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">Tous statuts</option>
          {Object.entries(ROOM_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">N°</th>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Capacité</th>
              <th className="px-4 py-3 text-left">Prix/nuit</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-left">Photos</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Aucune chambre</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono">{r.number}</td>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">{ROOM_TYPE_LABEL[r.type]}</td>
                <td className="px-4 py-3">{r.capacity}</td>
                <td className="px-4 py-3">{formatXOF(r.price_per_night)}</td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={(e) => changeStatus.mutate({ id: r.id, status: e.target.value as any })}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${ROOM_STATUS_BADGE[r.status]}`}
                  >
                    {Object.entries(ROOM_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">{r.photos.length}</td>
                <td className="px-4 py-3 text-right">
                  {canEdit && (
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditor({
                        id: r.id, number: r.number, name: r.name, type: r.type, capacity: r.capacity,
                        price_per_night: Number(r.price_per_night), description: r.description ?? "",
                        amenities: r.amenities.join(", "), size_sqm: r.size_sqm ?? "",
                        status: r.status, is_active: r.is_active,
                      })}>
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm(`Supprimer ${r.name} ?`)) remove.mutate(r.id); }}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editor && (
        <RoomEditor
          draft={editor}
          existing={rooms?.find((r) => r.id === editor.id)}
          onClose={() => setEditor(null)}
          onSave={(d) => upsert.mutate(d)}
          saving={upsert.isPending}
        />
      )}
    </div>
  );
}

function RoomEditor({ draft, existing, onClose, onSave, saving }: { draft: Draft; existing?: RoomWithPhotos; onClose: () => void; onSave: (d: Draft) => void; saving: boolean }) {
  const [d, setD] = useState<Draft>(draft);
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof Draft>(k: K, v: Draft[K]) { setD((p) => ({ ...p, [k]: v })); }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !existing) return;
    setUploading(true);
    try {
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${existing.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("room-photos").upload(path, file);
        if (upErr) throw upErr;
        const { data: signed } = await supabase.storage.from("room-photos").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        const url = signed?.signedUrl ?? "";
        const isFirst = (existing.photos.length === 0);
        const { error: insErr } = await supabase.from("room_photos").insert({
          room_id: existing.id, url, sort_order: existing.photos.length, is_cover: isFirst,
        });
        if (insErr) throw insErr;
      }
      toast.success("Photo(s) ajoutée(s)");
      qc.invalidateQueries({ queryKey: ["admin-rooms"] });
      qc.invalidateQueries({ queryKey: ["public-rooms"] });
    } catch (err: any) { toast.error(err.message); }
    finally { setUploading(false); e.target.value = ""; }
  }

  async function removePhoto(id: string) {
    const { error } = await supabase.from("room_photos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-rooms"] });
    qc.invalidateQueries({ queryKey: ["public-rooms"] });
  }

  async function addPhotoFromGallery(url: string) {
    if (!existing) return;
    const { error } = await supabase.from("room_photos").insert({
      room_id: existing.id,
      url,
      sort_order: existing.photos.length,
      is_cover: existing.photos.length === 0,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-rooms"] });
    qc.invalidateQueries({ queryKey: ["public-rooms"] });
    toast.success("Image ajoutée depuis la médiathèque");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-card shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <h2 className="font-display text-2xl">{d.id ? "Modifier la chambre" : "Nouvelle chambre"}</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); onSave(d); }}
          className="space-y-4 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <F label="N° chambre" required value={d.number} onChange={(v) => set("number", v)} />
            <F label="Nom" required value={d.name} onChange={(v) => set("name", v)} />
            <FSelect label="Type" value={d.type} onChange={(v) => set("type", v as any)}
              options={Object.entries(ROOM_TYPE_LABEL).map(([k, v]) => ({ value: k, label: v }))} />
            <FSelect label="Statut" value={d.status} onChange={(v) => set("status", v as any)}
              options={Object.entries(ROOM_STATUS_LABEL).map(([k, v]) => ({ value: k, label: v }))} />
            <F label="Capacité" type="number" value={String(d.capacity)} onChange={(v) => set("capacity", Number(v))} />
            <F label="Prix / nuit (XOF)" type="number" value={String(d.price_per_night)} onChange={(v) => set("price_per_night", Number(v))} />
            <F label="Surface (m²)" type="number" value={String(d.size_sqm)} onChange={(v) => set("size_sqm", v === "" ? "" : Number(v))} />
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input type="checkbox" checked={d.is_active} onChange={(e) => set("is_active", e.target.checked)} />
              Active (visible sur le site)
            </label>
          </div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">Description
            <textarea value={d.description} onChange={(e) => set("description", e.target.value)} rows={4}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground" />
          </label>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">Équipements (séparés par des virgules)
            <input value={d.amenities} onChange={(e) => set("amenities", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm" placeholder="Wifi, Climatisation, Minibar, Coffre-fort" />
          </label>

          {existing && (
            <>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Photos</h3>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-secondary">
                    <Upload className="size-4" />
                    {uploading ? "Envoi…" : "Ajouter"}
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                  </label>
                </div>
                {existing.photos.length === 0 ? (
                  <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><ImageIcon className="size-4" /> Aucune photo</p>
                ) : (
                  <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4">
                    {existing.photos.map((p) => (
                      <div key={p.id} className="group relative aspect-square overflow-hidden rounded-md bg-muted">
                        <EditableImage
                          src={p.url}
                          alt="Photo de chambre"
                          className="size-full object-cover"
                          onChange={async (url) => {
                            const { error } = await supabase.from("room_photos").update({ url }).eq("id", p.id);
                            if (error) { toast.error(error.message); return; }
                            toast.success("Photo mise à jour");
                            qc.invalidateQueries({ queryKey: ["admin-rooms"] });
                          }}
                        />
                        <button type="button" onClick={() => removePhoto(p.id)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100">
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-border p-4">
                <MediaPicker
                  value=""
                  onChange={(url) => void addPhotoFromGallery(url)}
                  label="Ajouter une image depuis la médiathèque"
                  triggerLabel="Choisir depuis la médiathèque"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="hero" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function F(props: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block text-xs uppercase tracking-wider text-muted-foreground">{props.label}
      <input type={props.type ?? "text"} value={props.value} required={props.required}
        onChange={(e) => props.onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground" />
    </label>
  );
}

function FSelect(props: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block text-xs uppercase tracking-wider text-muted-foreground">{props.label}
      <select value={props.value} onChange={(e) => props.onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground">
        {props.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}