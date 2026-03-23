import type {
  TaxInput,
  TaxResult,
  IRDetail,
  IRTranche,
  TVAStatus,
} from "./types";
import {
  COTISATIONS_RATES,
  VERSEMENT_LIBERATOIRE_RATES,
  ABATTEMENT_RATES,
  PLAFONDS_CA,
  TVA_THRESHOLDS,
  IR_TRANCHES,
  ACRE_REDUCTION,
  CFE_EXEMPTION_CA_THRESHOLD,
  CFE_MINIMUM_AMOUNT,
  ABATTEMENT_MINIMUM,
} from "./constants";

// ---------------------------------------------------------------------------
// Cotisations sociales
// ---------------------------------------------------------------------------

function computeCotisations(
  annualRevenue: number,
  activityType: TaxInput["activityType"],
  hasACRE: boolean
): number {
  const baseRate = COTISATIONS_RATES[activityType];
  const effectiveRate = hasACRE ? baseRate * (1 - ACRE_REDUCTION) : baseRate;
  return annualRevenue * effectiveRate;
}

// ---------------------------------------------------------------------------
// Impôt sur le Revenu
// ---------------------------------------------------------------------------

function computeIRVersementLiberatoire(
  annualRevenue: number,
  activityType: TaxInput["activityType"]
): IRDetail {
  const rate = VERSEMENT_LIBERATOIRE_RATES[activityType];
  return {
    mode: "versement_liberatoire",
    rate,
    amount: annualRevenue * rate,
  };
}

function computeIRBareme(
  annualRevenue: number,
  activityType: TaxInput["activityType"],
  nbParts: number,
  otherAnnualRevenue: number
): IRDetail {
  const abattementRate = ABATTEMENT_RATES[activityType];
  const rawAbattement = annualRevenue * abattementRate;
  const abattement = Math.max(rawAbattement, ABATTEMENT_MINIMUM);
  const revenueApresAbattement = Math.max(0, annualRevenue - abattement);
  const totalFoyerRevenu = revenueApresAbattement + otherAnnualRevenue;

  // Quotient familial
  const revenuParPart = totalFoyerRevenu / nbParts;

  const tranches: IRTranche[] = [];
  let irParPart = 0;

  for (const tranche of IR_TRANCHES) {
    if (revenuParPart <= tranche.min) break;
    const upper = tranche.max ?? Infinity;
    const taxableInTranche = Math.min(revenuParPart, upper) - tranche.min;
    const amountInTranche = taxableInTranche * tranche.rate;
    irParPart += amountInTranche;
    tranches.push({
      min: tranche.min,
      max: tranche.max,
      rate: tranche.rate,
      amount: amountInTranche * nbParts,
    });
  }

  const totalIR = irParPart * nbParts;

  // Part de l'IR imputable au revenu AE (au prorata)
  const irForAE =
    totalFoyerRevenu > 0
      ? totalIR * (revenueApresAbattement / totalFoyerRevenu)
      : totalIR;

  return {
    mode: "micro_bareme",
    taxableBase: revenueApresAbattement,
    amount: Math.max(0, irForAE),
    tranches,
  };
}

// ---------------------------------------------------------------------------
// TVA
// ---------------------------------------------------------------------------

function computeTVA(
  annualRevenue: number,
  activityType: TaxInput["activityType"],
  purchases: TaxInput["purchases"]
): TVAStatus {
  const threshold = TVA_THRESHOLDS[activityType].normal;
  const isRedevable = annualRevenue > threshold;

  const recoveredTVA = isRedevable
    ? purchases.reduce((acc, p) => {
        if (p.tvaRate === 0) return acc;
        const tvaAmount = (p.amount / (1 + p.tvaRate / 100)) * (p.tvaRate / 100);
        return acc + tvaAmount;
      }, 0)
    : 0;

  return { isRedevable, threshold, recoveredTVA };
}

// ---------------------------------------------------------------------------
// CFE
// ---------------------------------------------------------------------------

function computeCFE(
  annualRevenue: number,
  isFirstYear: boolean
): TaxResult["cfe"] {
  if (isFirstYear) {
    return { amount: 0, isExempt: true, reason: "Première année d'activité" };
  }
  if (annualRevenue <= CFE_EXEMPTION_CA_THRESHOLD) {
    return {
      amount: 0,
      isExempt: true,
      reason: `Chiffre d'affaires ≤ ${CFE_EXEMPTION_CA_THRESHOLD.toLocaleString("fr-FR")} €`,
    };
  }
  return { amount: CFE_MINIMUM_AMOUNT, isExempt: false };
}

// ---------------------------------------------------------------------------
// Main computation
// ---------------------------------------------------------------------------

export function computeTaxes(
  input: TaxInput,
  isFirstYear = false
): TaxResult {
  const { activityType, annualRevenue, options, purchases } = input;
  const { hasACRE, useVersementLiberatoire, nbParts, otherAnnualRevenue } =
    options;

  const plafondCA = PLAFONDS_CA[activityType];
  const isAbovePlafond = annualRevenue > plafondCA;

  const cotisationsSociales = computeCotisations(
    annualRevenue,
    activityType,
    hasACRE
  );

  const ir = useVersementLiberatoire
    ? computeIRVersementLiberatoire(annualRevenue, activityType)
    : computeIRBareme(annualRevenue, activityType, nbParts, otherAnnualRevenue);

  const tva = computeTVA(annualRevenue, activityType, purchases);
  const cfe = computeCFE(annualRevenue, isFirstYear);

  const totalTaxes =
    cotisationsSociales +
    ir.amount +
    cfe.amount -
    tva.recoveredTVA;

  const netRevenue = annualRevenue - totalTaxes;
  const effectiveRate = annualRevenue > 0 ? totalTaxes / annualRevenue : 0;

  return {
    annualRevenue,
    cotisationsSociales,
    cotisationDetail: {
      label: "Cotisations sociales",
      rate: hasACRE
        ? COTISATIONS_RATES[activityType] * (1 - ACRE_REDUCTION)
        : COTISATIONS_RATES[activityType],
      amount: cotisationsSociales,
    },
    ir,
    cfe,
    tva,
    totalTaxes,
    netRevenue,
    effectiveRate,
    plafondCA,
    isAbovePlafond,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(rate: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rate);
}
