import { useState } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/taxCalculations";
import { PLAFONDS_CA } from "@/lib/constants";
import type { ActivityType } from "@/lib/types";

type Frequency = "monthly" | "annual";

interface RevenueInputProps {
  activityType: ActivityType;
  annualRevenue: number;
  onAnnualRevenueChange: (value: number) => void;
}

export function RevenueInput({
  activityType,
  annualRevenue,
  onAnnualRevenueChange,
}: RevenueInputProps) {
  const [frequency, setFrequency] = useState<Frequency>("annual");
  const [rawInput, setRawInput] = useState(
    frequency === "annual"
      ? String(annualRevenue || "")
      : String(annualRevenue ? Math.round(annualRevenue / 12) : "")
  );

  const plafond = PLAFONDS_CA[activityType];
  const progressPercent = Math.min((annualRevenue / plafond) * 100, 100);
  const isAbovePlafond = annualRevenue > plafond;
  const isNearPlafond = !isAbovePlafond && progressPercent >= 80;

  function handleFrequencyChange(freq: Frequency) {
    setFrequency(freq);
    const displayValue =
      freq === "monthly"
        ? annualRevenue
          ? String(Math.round(annualRevenue / 12))
          : ""
        : annualRevenue
          ? String(annualRevenue)
          : "";
    setRawInput(displayValue);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\s/g, "").replace(",", ".");
    setRawInput(raw);
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 0) {
      const annual = frequency === "monthly" ? num * 12 : num;
      onAnnualRevenueChange(annual);
    } else if (raw === "" || raw === "0") {
      onAnnualRevenueChange(0);
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Chiffre d'affaires</Label>

      {/* Frequency toggle */}
      <div className="flex rounded-lg border border-input overflow-hidden">
        {(["annual", "monthly"] as Frequency[]).map((freq) => (
          <button
            key={freq}
            type="button"
            onClick={() => handleFrequencyChange(freq)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
              frequency === freq
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {freq === "annual" ? "Annuel" : "Mensuel"}
          </button>
        ))}
      </div>

      <div className="relative">
        <Input
          type="number"
          min="0"
          step="100"
          value={rawInput}
          onChange={handleInputChange}
          placeholder={frequency === "annual" ? "Ex : 45 000" : "Ex : 3 750"}
          className="pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          €
        </span>
      </div>

      {frequency === "monthly" && annualRevenue > 0 && (
        <p className="text-xs text-muted-foreground">
          Soit {formatCurrency(annualRevenue)} par an
        </p>
      )}

      {/* Progress bar vs plafond */}
      {annualRevenue > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Plafond du régime
            </span>
            <span
              className={
                isAbovePlafond
                  ? "text-destructive font-semibold"
                  : isNearPlafond
                    ? "text-amber-600 dark:text-amber-400 font-medium"
                    : "text-muted-foreground"
              }
            >
              {formatCurrency(annualRevenue)} / {formatCurrency(plafond)}
            </span>
          </div>
          <Progress
            value={progressPercent}
            className={
              isAbovePlafond
                ? "[&>div]:bg-destructive"
                : isNearPlafond
                  ? "[&>div]:bg-amber-500"
                  : ""
            }
          />
          {isAbovePlafond && (
            <div className="flex items-start gap-1.5 rounded-md bg-destructive/10 p-2">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive">
                Dépassement du plafond auto-entrepreneur. Vous devrez changer de
                régime fiscal.
              </p>
            </div>
          )}
          {isNearPlafond && !isAbovePlafond && (
            <div className="flex items-start gap-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20 p-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Vous approchez du plafond ({Math.round(progressPercent)}% atteint).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
