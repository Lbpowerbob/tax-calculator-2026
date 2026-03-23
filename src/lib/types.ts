export type ActivityType = "VENTE" | "SERVICES_BIC" | "LIBERAL_BNC" | "LIBERAL_CIPAV";

export type TVARate = 0 | 5.5 | 10 | 20;

export interface Purchase {
  id: string;
  description: string;
  amount: number; // TTC
  tvaRate: TVARate;
}

export interface TaxOptions {
  hasACRE: boolean;
  useVersementLiberatoire: boolean;
  nbParts: number;
  otherAnnualRevenue: number;
}

export interface TaxInput {
  activityType: ActivityType;
  annualRevenue: number;
  options: TaxOptions;
  purchases: Purchase[];
}

export interface CotisationDetail {
  label: string;
  rate: number;
  amount: number;
}

export interface IRDetail {
  mode: "versement_liberatoire" | "micro_bareme";
  rate?: number; // for versement libératoire
  taxableBase?: number; // after abattement
  amount: number;
  tranches?: IRTranche[];
}

export interface IRTranche {
  min: number;
  max: number | null;
  rate: number;
  amount: number;
}

export interface TVAStatus {
  isRedevable: boolean;
  threshold: number;
  recoveredTVA: number;
}

export interface TaxResult {
  annualRevenue: number;
  cotisationsSociales: number;
  cotisationDetail: CotisationDetail;
  ir: IRDetail;
  cfe: { amount: number; isExempt: boolean; reason?: string };
  tva: TVAStatus;
  totalTaxes: number;
  netRevenue: number;
  effectiveRate: number;
  plafondCA: number;
  isAbovePlafond: boolean;
}
