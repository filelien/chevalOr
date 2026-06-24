function escapeCell(value: unknown) {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

/** Télécharge un fichier CSV (UTF-8 BOM pour Excel). */
export function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + lines], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
