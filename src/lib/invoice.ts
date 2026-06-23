import jsPDF from "jspdf";
import { formatXOF } from "./rooms";

export type InvoiceData = {
  reference: string;
  type: "invoice" | "receipt";
  client: { name: string; email?: string | null; phone?: string | null; address?: string | null };
  room: { name: string; number: string };
  check_in: string;
  check_out: string;
  nights: number;
  guests_count: number;
  price_per_night: number;
  total: number;
  payment_method?: string | null;
  paid_at?: string | null;
  issued_at?: string;
};

const GOLD: [number, number, number] = [184, 134, 11];
const ONYX: [number, number, number] = [17, 17, 17];

export function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 20;
  let y = M;

  // Header band
  doc.setFillColor(...ONYX);
  doc.rect(0, 0, W, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("HÔTEL LE CHEVAL D'OR", M, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(212, 175, 55);
  doc.text("Élégance & hospitalité — Anié, Togo", M, 21);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("contact@chevaldor.tg  ·  +228 00 00 00 00", M, 27);

  // Title
  y = 46;
  doc.setTextColor(...ONYX);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(data.type === "invoice" ? "FACTURE" : "REÇU DE PAIEMENT", M, y);

  // Ref + date block right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const issued = data.issued_at ?? new Date().toLocaleDateString("fr-FR");
  doc.text(`Référence : ${data.reference}`, W - M, y - 6, { align: "right" });
  doc.text(`Date : ${issued}`, W - M, y, { align: "right" });

  // Client block
  y += 14;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(M, y, W - M, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.text("FACTURÉ À", M, y);
  doc.setTextColor(...ONYX);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text(data.client.name || "—", M, y);
  if (data.client.email) { y += 5; doc.text(data.client.email, M, y); }
  if (data.client.phone) { y += 5; doc.text(data.client.phone, M, y); }
  if (data.client.address) { y += 5; doc.text(data.client.address, M, y); }

  // Stay details box
  y += 10;
  doc.setFillColor(248, 246, 240);
  doc.rect(M, y, W - 2 * M, 28, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.text("SÉJOUR", M + 4, y + 7);
  doc.setTextColor(...ONYX);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Chambre : ${data.room.name} (n° ${data.room.number})`, M + 4, y + 14);
  doc.text(`Arrivée : ${data.check_in}    Départ : ${data.check_out}`, M + 4, y + 20);
  doc.text(`${data.nights} nuit(s)  ·  ${data.guests_count} personne(s)`, M + 4, y + 26);

  // Items table
  y += 38;
  doc.setFillColor(...ONYX);
  doc.rect(M, y, W - 2 * M, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Description", M + 4, y + 6);
  doc.text("Qté", 120, y + 6);
  doc.text("P.U.", 145, y + 6);
  doc.text("Total", W - M - 4, y + 6, { align: "right" });
  y += 9;

  doc.setTextColor(...ONYX);
  doc.setFont("helvetica", "normal");
  y += 7;
  doc.text(`Hébergement — ${data.room.name}`, M + 4, y);
  doc.text(String(data.nights), 120, y);
  doc.text(formatXOF(data.price_per_night), 145, y);
  doc.text(formatXOF(data.total), W - M - 4, y, { align: "right" });

  // Totals
  y += 12;
  doc.setDrawColor(...GOLD);
  doc.line(120, y, W - M, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL TTC", 120, y);
  doc.setTextColor(...GOLD);
  doc.text(formatXOF(data.total), W - M - 4, y, { align: "right" });

  // Payment block
  if (data.type === "receipt") {
    y += 14;
    doc.setTextColor(...ONYX);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("PAIEMENT REÇU", M, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(`Méthode : ${data.payment_method ?? "—"}`, M, y);
    if (data.paid_at) { y += 5; doc.text(`Reçu le : ${new Date(data.paid_at).toLocaleString("fr-FR")}`, M, y); }
  }

  // Footer
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.text("Hôtel Le Cheval d'Or — Anié, Togo. Merci de votre confiance.", W / 2, 285, { align: "center" });

  doc.save(`${data.type === "invoice" ? "facture" : "recu"}-${data.reference}.pdf`);
}