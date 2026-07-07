import logo from "@/assets/logo-transparent.png";
import { HOTEL } from "@/lib/content";
import { formatXOF } from "@/lib/rooms";
import type { AdminReportsData } from "@/lib/reports";

export const HOTEL_LOGO_URL = logo;

export function brandPrintStyles() {
  return `
    * { box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #111; margin: 0; padding: 24px 32px 40px; background: #fff; }
    .brand-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; border-bottom: 2px solid #C9A227; padding-bottom: 20px; margin-bottom: 28px; }
    .brand-header img { height: 80px; width: auto; object-fit: contain; }
    .brand-meta { text-align: right; font-size: 11px; color: #444; line-height: 1.65; }
    .brand-title { font-size: 20px; letter-spacing: 0.06em; color: #111; margin: 0 0 6px; font-weight: 700; }
    .brand-subtitle { color: #C9A227; font-size: 12px; margin: 0 0 8px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
    .kpi { border: 1px solid #e8e4da; border-radius: 10px; padding: 14px; background: #faf8f4; }
    .kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #777; }
    .kpi-value { font-size: 18px; font-weight: 700; margin-top: 6px; color: #C9A227; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
    th, td { border: 1px solid #e8e4da; padding: 8px 10px; text-align: left; }
    th { background: #f8f6f1; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
    .section { margin-top: 28px; }
    .section h2 { font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; color: #C9A227; margin: 0 0 10px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e8e4da; text-align: center; font-size: 10px; color: #888; }
    @media print { body { padding: 16px 24px; } }
  `;
}

export function brandPrintHeader(title: string, subtitle?: string) {
  return `
    <div class="brand-header">
      <img src="${logo}" alt="Hôtel Le Cheval d'Or" />
      <div class="brand-meta">
        <h1 class="brand-title">${title}</h1>
        ${subtitle ? `<p class="brand-subtitle">${subtitle}</p>` : ""}
        <p>${HOTEL.address}</p>
        <p>${HOTEL.phone} · ${HOTEL.secondaryPhone}</p>
        <p>${HOTEL.email}</p>
        <p><em>${HOTEL.locationHint}</em></p>
      </div>
    </div>
  `;
}

export function openBrandedPrintWindow(opts: { title: string; subtitle?: string; body: string }) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html lang="fr"><head>
    <meta charset="utf-8"><title>${opts.title}</title>
    <style>${brandPrintStyles()}</style>
  </head><body>
    ${brandPrintHeader(opts.title, opts.subtitle)}
    ${opts.body}
    <div class="footer">© ${new Date().getFullYear()} Hôtel Le Cheval d'Or — Anié, Togo</div>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

export function printAdminReport(data: AdminReportsData, from: string, to: string) {
  const rows = (items: { label: string; value: string }[]) =>
    items.map((r) => `<tr><td>${r.label}</td><td>${r.value}</td></tr>`).join("");

  const body = `
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-label">CA total</div><div class="kpi-value">${formatXOF(data.totals.totalRevenue)}</div></div>
      <div class="kpi"><div class="kpi-label">Profit net</div><div class="kpi-value">${formatXOF(data.totals.netProfit)}</div></div>
      <div class="kpi"><div class="kpi-label">Clients actifs</div><div class="kpi-value">${data.totals.activeClients}</div></div>
      <div class="kpi"><div class="kpi-label">Taux d'occupation</div><div class="kpi-value">${data.totals.occupancyRate}%</div></div>
    </div>

    <div class="section">
      <h2>Résumé financier</h2>
      <table>
        <thead><tr><th>Indicateur</th><th>Valeur</th></tr></thead>
        <tbody>${rows([
          { label: "CA hôtel", value: formatXOF(data.totals.hotelRevenue) },
          { label: "CA restaurant", value: formatXOF(data.totals.restaurantRevenue) },
          { label: "Dépenses", value: formatXOF(data.totals.totalExpenses) },
          { label: "Clients VIP", value: String(data.totals.vipClients) },
          { label: "Séjour moyen", value: `${data.totals.averageStay.toFixed(1)} nuit(s)` },
        ])}</tbody>
      </table>
    </div>

    <div class="section">
      <h2>Top chambres</h2>
      <table>
        <thead><tr><th>Chambre</th><th>Réservations</th><th>CA</th></tr></thead>
        <tbody>${data.roomPerformance.slice(0, 8).map((r) =>
          `<tr><td>${r.roomName} n°${r.roomNumber}</td><td>${r.bookings}</td><td>${formatXOF(r.revenue)}</td></tr>`
        ).join("")}</tbody>
      </table>
    </div>

    <div class="section">
      <h2>Produits restaurant</h2>
      <table>
        <thead><tr><th>Produit</th><th>Quantité</th><th>CA</th></tr></thead>
        <tbody>${data.topRestaurantProducts.slice(0, 8).map((p) =>
          `<tr><td>${p.name}</td><td>${p.quantity}</td><td>${formatXOF(p.revenue)}</td></tr>`
        ).join("")}</tbody>
      </table>
    </div>
  `;

  openBrandedPrintWindow({
    title: "Rapport d'activité",
    subtitle: `Période du ${formatDate(from)} au ${formatDate(to)}`,
    body,
  });
}

export function printAccountingReport(opts: {
  title: string;
  subtitle: string;
  rows: Array<{ label: string; debit: string; credit: string }>;
  summary?: Array<{ label: string; value: string }>;
}) {
  const rows = opts.rows.map((r) =>
    `<tr><td>${r.label}</td><td style="text-align:right">${r.debit}</td><td style="text-align:right">${r.credit}</td></tr>`
  ).join("");

  const summary = opts.summary?.length
    ? `<div class="section"><h2>Synthèse</h2><table><tbody>${opts.summary.map((s) =>
        `<tr><td>${s.label}</td><td style="text-align:right;font-weight:700">${s.value}</td></tr>`
      ).join("")}</tbody></table></div>`
    : "";

  openBrandedPrintWindow({
    title: opts.title,
    subtitle: opts.subtitle,
    body: `
      <div class="section">
        <table>
          <thead><tr><th>Compte</th><th>Débit</th><th>Crédit</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${summary}
    `,
  });
}

export function brandedCodePrintHtml(code: string, qrUrl: string, barcodeUrl: string) {
  return `<!DOCTYPE html><html lang="fr"><head>
    <meta charset="utf-8"><title>${code}</title>
    <style>${brandPrintStyles()}
      body { text-align: center; padding: 40px; }
      .code { font-size: 22px; font-weight: bold; letter-spacing: 0.15em; margin: 20px 0; }
      .brand-header { justify-content: center; flex-direction: column; align-items: center; text-align: center; }
      .brand-meta { text-align: center; }
    </style></head><body>
    <div class="brand-header">
      <img src="${logo}" alt="Hôtel Le Cheval d'Or" />
    </div>
    <p class="code">${code}</p>
    <img src="${qrUrl}" width="180" height="180" alt="QR" />
    <br />
    <img src="${barcodeUrl}" height="60" alt="Code-barres" style="margin-top:16px" />
    <div class="footer">${HOTEL.address} · ${HOTEL.phone}</div>
  </body></html>`;
}
