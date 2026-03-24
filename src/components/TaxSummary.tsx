import { TrendingDown, Wallet, Receipt, PiggyBank, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/taxCalculations";
import { COTISATIONS_RATES } from "@/lib/constants";
import type { TaxResult, ActivityType } from "@/lib/types";

interface TaxSummaryProps {
  result: TaxResult;
  activityType: ActivityType;
  hasACRE: boolean;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
}

function MetricCard({ title, value, subtitle, icon, iconBg, valueColor = "text-foreground" }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{title}</p>
        <p className={`text-lg font-bold mt-0.5 tabular-nums leading-tight ${valueColor}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function TaxSummary({ result, activityType, hasACRE }: TaxSummaryProps) {
  const effectiveRateColor =
    result.effectiveRate > 0.35
      ? "text-red-500 dark:text-red-400"
      : result.effectiveRate > 0.25
        ? "text-amber-500 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400";

  const baseRate = COTISATIONS_RATES[activityType];
  const appliedRate = hasACRE ? baseRate * 0.5 : baseRate;

  const netIsPositive = result.netRevenue >= 0;

  return (
    <div className="space-y-3">
      {result.isAbovePlafond && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 flex gap-3">
          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              Plafond auto-entrepreneur dépassé
            </p>
            <p className="text-xs text-red-500/80 dark:text-red-400/70 mt-0.5">
              Au-delà du plafond, vous basculez vers un régime réel d'imposition.
            </p>
          </div>
        </div>
      )}

      {/* Hero card — revenu net */}
      <div
        className={`rounded-2xl p-5 text-white relative overflow-hidden ${
          netIsPositive
            ? "bg-gradient-to-br from-emerald-500 to-teal-600"
            : "bg-gradient-to-br from-red-500 to-rose-600"
        }`}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10 blur-lg pointer-events-none" />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white/75">Revenu net estimé</p>
            <p className="text-4xl font-extrabold mt-1 tabular-nums tracking-tight">
              {formatCurrency(result.netRevenue)}
            </p>
            <p className="text-sm text-white/65 mt-1.5">
              par mois : <span className="font-semibold text-white/90">{formatCurrency(result.netRevenue / 12)}</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
            <Wallet className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Bento 3-card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <MetricCard
          title="Total charges & impôts"
          value={formatCurrency(result.totalTaxes)}
          subtitle={`Mensuel : ${formatCurrency(result.totalTaxes / 12)}`}
          icon={<Receipt className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-100 dark:bg-amber-900/40"
          valueColor="text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          title="Taux effectif global"
          value={formatPercent(result.effectiveRate)}
          subtitle="Sur le CA brut"
          icon={<TrendingDown className={`h-4 w-4 ${effectiveRateColor}`} />}
          iconBg={
            result.effectiveRate > 0.35
              ? "bg-red-100 dark:bg-red-900/40"
              : result.effectiveRate > 0.25
                ? "bg-amber-100 dark:bg-amber-900/40"
                : "bg-emerald-100 dark:bg-emerald-900/40"
          }
          valueColor={effectiveRateColor}
        />
        <MetricCard
          title="Cotisations sociales"
          value={formatPercent(appliedRate)}
          subtitle={hasACRE ? "Taux ACRE (−50%)" : "Taux plein"}
          icon={<PiggyBank className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-100 dark:bg-blue-900/40"
          valueColor="text-blue-600 dark:text-blue-400"
        />
      </div>

      {result.tva.isRedevable && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              TVA récuperable sur achats
            </p>
            <Badge variant="success" className="tabular-nums">
              {formatCurrency(result.tva.recoveredTVA)}
            </Badge>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            Vous êtes redevable de la TVA (CA &gt; {formatCurrency(result.tva.threshold)}).
            Pensez à collecter et déclarer la TVA sur vos ventes.
          </p>
        </div>
      )}
    </div>
  );
}
