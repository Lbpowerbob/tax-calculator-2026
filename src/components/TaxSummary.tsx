import { TrendingDown, Wallet, Receipt, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/taxCalculations";
import { COTISATIONS_RATES } from "@/lib/constants";
import type { TaxResult, ActivityType } from "@/lib/types";

interface TaxSummaryProps {
  result: TaxResult;
  activityType: ActivityType;
  hasACRE: boolean;
}

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
}: SummaryCardProps) {
  const colorMap = {
    default: "text-foreground",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    destructive: "text-destructive",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className={`text-xl font-bold mt-0.5 ${colorMap[variant]}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="p-2 rounded-lg bg-muted shrink-0">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TaxSummary({
  result,
  activityType,
  hasACRE,
}: TaxSummaryProps) {
  const effectiveRateVariant =
    result.effectiveRate > 0.35
      ? "destructive"
      : result.effectiveRate > 0.25
        ? "warning"
        : "success";

  const baseRate = COTISATIONS_RATES[activityType];
  const appliedRate = hasACRE ? baseRate * 0.5 : baseRate;

  return (
    <div className="space-y-4">
      {result.isAbovePlafond && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
          <p className="text-sm text-destructive font-medium">
            Plafond auto-entrepreneur dépassé
          </p>
          <p className="text-xs text-destructive/80 mt-1">
            Ces calculs restent indicatifs. Au-delà du plafond, vous basculez
            automatiquement vers un régime réel d'imposition.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          title="Revenu net estimé"
          value={formatCurrency(result.netRevenue)}
          subtitle={`Mensuel : ${formatCurrency(result.netRevenue / 12)}`}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          variant={result.netRevenue > 0 ? "success" : "destructive"}
        />
        <SummaryCard
          title="Total charges & impôts"
          value={formatCurrency(result.totalTaxes)}
          subtitle={`Mensuel : ${formatCurrency(result.totalTaxes / 12)}`}
          icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
          variant="warning"
        />
        <SummaryCard
          title="Taux effectif global"
          value={formatPercent(result.effectiveRate)}
          subtitle="Sur le CA brut"
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          variant={effectiveRateVariant}
        />
        <SummaryCard
          title="Cotisations sociales"
          value={formatPercent(appliedRate)}
          subtitle={hasACRE ? "Taux ACRE (−50%)" : "Taux plein"}
          icon={<PiggyBank className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {result.tva.isRedevable && (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              TVA récuperable sur achats
            </p>
            <Badge variant="success">
              {formatCurrency(result.tva.recoveredTVA)}
            </Badge>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Vous êtes redevable de la TVA (CA &gt; {formatCurrency(result.tva.threshold)}).
            Pensez à collecter et déclarer la TVA sur vos ventes.
          </p>
        </div>
      )}
    </div>
  );
}
