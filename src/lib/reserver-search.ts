/** Paramètres de recherche par défaut pour la route /reserver */
export function reserverSearch(overrides?: {
  in?: string;
  out?: string;
  guests?: string;
  promo?: string;
}) {
  return {
    in: overrides?.in ?? "",
    out: overrides?.out ?? "",
    guests: overrides?.guests ?? "2",
    promo: overrides?.promo ?? "",
  };
}
