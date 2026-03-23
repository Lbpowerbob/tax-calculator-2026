import type { ActivityType } from "./types";

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  VENTE: "Vente de marchandises / Fourniture de logement",
  SERVICES_BIC: "Prestations de services (artisan / commerçant)",
  LIBERAL_BNC: "Profession libérale (hors CIPAV)",
  LIBERAL_CIPAV: "Profession libérale (CIPAV)",
};

export const ACTIVITY_DESCRIPTIONS: Record<ActivityType, string> = {
  VENTE: "Achat-revente, e-commerce, restauration, hébergement (BIC)",
  SERVICES_BIC: "Plombier, électricien, coiffeur, informaticien... (BIC)",
  LIBERAL_BNC: "Médecin, avocat, consultant, développeur freelance... (BNC)",
  LIBERAL_CIPAV:
    "Architecte, ingénieur, géomètre-expert, ostéopathe... (CIPAV)",
};

/** Taux de cotisations sociales 2026 (Urssaf) */
export const COTISATIONS_RATES: Record<ActivityType, number> = {
  VENTE: 0.123, // 12,3%
  SERVICES_BIC: 0.212, // 21,2%
  LIBERAL_BNC: 0.256, // 25,6% (nouveau taux 2026)
  LIBERAL_CIPAV: 0.232, // 23,2%
};

/** Taux du versement libératoire de l'IR (optionnel) */
export const VERSEMENT_LIBERATOIRE_RATES: Record<ActivityType, number> = {
  VENTE: 0.01, // 1%
  SERVICES_BIC: 0.017, // 1,7%
  LIBERAL_BNC: 0.022, // 2,2%
  LIBERAL_CIPAV: 0.022, // 2,2%
};

/** Abattement forfaitaire pour calcul de l'IR (régime micro, barème progressif) */
export const ABATTEMENT_RATES: Record<ActivityType, number> = {
  VENTE: 0.71, // 71%
  SERVICES_BIC: 0.5, // 50%
  LIBERAL_BNC: 0.34, // 34%
  LIBERAL_CIPAV: 0.34, // 34%
};

/** Plafonds de CA 2026 (valables jusqu'en 2028) */
export const PLAFONDS_CA: Record<ActivityType, number> = {
  VENTE: 203_100,
  SERVICES_BIC: 83_600,
  LIBERAL_BNC: 83_600,
  LIBERAL_CIPAV: 83_600,
};

/** Seuils de franchise de TVA 2026 */
export const TVA_THRESHOLDS: Record<
  ActivityType,
  { normal: number; majore: number }
> = {
  VENTE: { normal: 85_000, majore: 93_500 },
  SERVICES_BIC: { normal: 37_500, majore: 41_250 },
  LIBERAL_BNC: { normal: 37_500, majore: 41_250 },
  LIBERAL_CIPAV: { normal: 37_500, majore: 41_250 },
};

/** Tranches de l'IR 2025 (barème progressif — référence pour 1 part) */
export const IR_TRANCHES = [
  { min: 0, max: 11_294, rate: 0 },
  { min: 11_294, max: 28_797, rate: 0.11 },
  { min: 28_797, max: 82_341, rate: 0.3 },
  { min: 82_341, max: 177_106, rate: 0.41 },
  { min: 177_106, max: null, rate: 0.45 },
];

/** Réduction ACRE : 50% sur les cotisations, pendant 4 trimestres civils */
export const ACRE_REDUCTION = 0.5;

/** Seuil d'exonération CFE */
export const CFE_EXEMPTION_CA_THRESHOLD = 5_000;

/**
 * Montant minimum de la cotisation minimum CFE (estimation nationale).
 * Varie selon la commune — valeur indicative.
 */
export const CFE_MINIMUM_AMOUNT = 227;

/** Abattement minimum (305 €) */
export const ABATTEMENT_MINIMUM = 305;
