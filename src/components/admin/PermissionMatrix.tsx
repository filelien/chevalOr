import { Check } from "lucide-react";
import { MATRIX_COLUMNS, moduleRows } from "@/lib/permission-matrix";
import type { PermissionKey } from "@/lib/permissions";

type Props = {
  draft: Set<PermissionKey>;
  canEdit: boolean;
  locked?: boolean;
  onToggle: (key: PermissionKey) => void;
};

export function PermissionMatrix({ draft, canEdit, locked, onToggle }: Props) {
  const rows = moduleRows();

  return (
    <div className="permission-matrix overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border bg-[#f8f6f1]">
            <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[160px]">
              Module
            </th>
            {MATRIX_COLUMNS.map((col) => (
              <th key={col.id} className="p-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-secondary/20"}>
              <td className="p-3 font-medium text-foreground">{row.label}</td>
              {MATRIX_COLUMNS.map((col) => {
                const perm = row.cells.find((c) => c.column === col.id)?.permission;
                if (!perm) {
                  return <td key={col.id} className="p-2 text-center text-muted-foreground/30">—</td>;
                }
                const on = draft.has(perm);
                return (
                  <td key={col.id} className="p-2 text-center">
                    <button
                      type="button"
                      disabled={!canEdit || locked}
                      onClick={() => onToggle(perm)}
                      className={`permission-cell mx-auto flex size-8 items-center justify-center rounded-md border transition ${
                        on
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-border bg-white text-transparent hover:border-gold-deep/40"
                      } ${!canEdit || locked ? "cursor-default opacity-60" : "cursor-pointer hover:scale-105"}`}
                      title={perm}
                    >
                      {on && <Check className="size-4 stroke-[3]" />}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
