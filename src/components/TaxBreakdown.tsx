import { ChevronDown, ChevronUp, Building2, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/taxCalculations";
import { ABATTEMENT_RATES } from "@/lib/constants";
import type { TaxResult, ActivityType } from "@/lib/types";

interface TaxBreakdownProps {
  result: TaxResult;
  activityType: ActivityType;
}

interface LineItemProps {
  label: string;
  value: string;
  subItems?: { label: string; value: string; highlight?: boolean }[];
  badge?: string;
  badgeVariant?: "default" | "secondary" | "success" | "warning" | "info" | "outline";
  muted?: boolean;
  positive?: boolean;
}

function LineItem({
  label,
  value,
  subItems,
  badge,
  badgeVariant = "secondary",
  muted,
  positive,
}: LineItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div
        className={`flex items-center justify-between gap-2 py-2 ${subItems ? "cursor-pointer hover:bg-muted/30 rounded-md px-2 -mx-2" : ""}`}
        onClick={() => subItems && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-sm ${muted ? "text-muted-foreground" : ""}`}>
            {label}
          </span>
          {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
          {subItems && (
            expanded
              ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
              : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
        <span
          className={`text-sm font-semibold shrink-0 ${
            positive
              ? "text-green-600 dark:text-green-400"
              : muted
                ? "text-muted-foreground"
                : ""
          }`}
        >
          {value}
        </span>
      </div>
      {subItems && expanded && (
        <div className="ml-4 space-y-1 pb-1">
          {subItems.map((item, i) => (
            <div key={i} className="flex justify-between text-xs py-0.5">
              <span className="text-muted-foreground">{item.label}</span>
              <span className={item.highlight ? "font-medium text-foreground" : "text-muted-foreground"}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TaxBreakdown({ result, activityType }: TaxBreakdownProps) {
  const { ir, cotisationDetail, cfe, tva, annualRevenue } = result;
  const abattement = ABATTEMENT_RATES[activityType];

  const irSubItems =
    ir.mode === "versement_liberatoire"
      ? [
          {
            label: "Mode",
            value: "Versement libératoire",
            highlight: true,
          },
          {
            label: "Taux",
            value: formatPercent(ir.rate ?? 0),
            highlight: true,
          },
          {
            label: "Base de calcul",
            value: formatCurrency(annualRevenue),
            highlight: false,
          },
        ]
      : [
          {
            label: "Mode",
            value: "Barème progressif (micro)",
            highlight: true,
          },
          {
            label: `Abattement forfaitaire (${formatPercent(abattement)})`,
            value: `−${formatCurrency(annualRevenue * abattement)}`,
            highlight: false,
          },
          {
            label: "Revenu imposable (part AE)",
            value: formatCurrency(ir.taxableBase ?? 0),
            highlight: true,
          },
          ...(ir.tranches ?? [])
            .filter((t) => t.amount > 0)
            .map((t) => ({
              label: `Tranche à ${formatPercent(t.rate)} (${formatCurrency(t.min)} – ${t.max ? formatCurrency(t.max) : "∞"})`,
              value: formatCurrency(t.amount),
              highlight: false,
            })),
        ];

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Détail du calcul (annuel)
      </p>

      <LineItem
        label="Chiffre d'affaires brut"
        value={formatCurrency(annualRevenue)}
      />

      <Separator />

      <LineItem
        label={cotisationDetail.label}
        value={`−${formatCurrency(cotisationDetail.amount)}`}
        badge={formatPercent(cotisationDetail.rate)}
        badgeVariant="info"
        subItems={[
          {
            label: "Taux applicable",
            value: formatPercent(cotisationDetail.rate),
            highlight: true,
          },
          { label: "Base", value: formatCurrency(annualRevenue) },
        ]}
      />

      <LineItem
        label="Impôt sur le revenu (part AE)"
        value={`−${formatCurrency(ir.amount)}`}
        badge={
          ir.mode === "versement_liberatoire"
            ? `VL ${formatPercent(ir.rate ?? 0)}`
            : "Micro-barème"
        }
        badgeVariant={ir.mode === "versement_liberatoire" ? "success" : "secondary"}
        subItems={irSubItems}
      />

      <LineItem
        label="CFE (Cotisation Foncière Entreprises)"
        value={cfe.isExempt ? "Exonéré" : `−${formatCurrency(cfe.amount)}`}
        badge={cfe.isExempt ? "Exonération" : undefined}
        badgeVariant="success"
        muted={cfe.isExempt}
        subItems={
          cfe.isExempt
            ? [{ label: "Motif", value: cfe.reason ?? "", highlight: true }]
            : [
                {
                  label: "Montant estimé (cotisation minimum)",
                  value: formatCurrency(cfe.amount),
                  highlight: true,
                },
                {
                  label: "Note",
                  value: "Varie selon la commune",
                  highlight: false,
                },
              ]
        }
      />

      {tva.isRedevable && tva.recoveredTVA > 0 && (
        <LineItem
          label="TVA récupérée sur achats"
          value={`+${formatCurrency(tva.recoveredTVA)}`}
          badge="TVA déductible"
          badgeVariant="success"
          positive
        />
      )}

      <Separator />

      <div className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/60 dark:border-emerald-800/60">
        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Revenu net estimé</span>
        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
          {formatCurrency(result.netRevenue)}
        </span>
      </div>

      <div className="rounded-xl bg-muted/40 border border-border/60 p-3 mt-2 space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">
            Formation professionnelle
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          La contribution à la formation professionnelle (CFP) est incluse dans
          vos cotisations sociales Urssaf (0,1 % à 0,3 % selon l'activité).
        </p>

        <Separator />

        <div className="flex items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">
            Rappel important
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Les montants affichés sont des estimations. Consultez un expert-comptable
          pour votre situation personnelle. Taux 2026 — source : Urssaf.
        </p>
      </div>
    </div>
  );
}
