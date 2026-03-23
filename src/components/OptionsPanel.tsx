import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { formatPercent } from "@/lib/taxCalculations";
import { VERSEMENT_LIBERATOIRE_RATES } from "@/lib/constants";
import type { ActivityType, TaxOptions } from "@/lib/types";

interface OptionsPanelProps {
  activityType: ActivityType;
  options: TaxOptions;
  isFirstYear: boolean;
  onOptionsChange: (options: TaxOptions) => void;
  onFirstYearChange: (value: boolean) => void;
}

function OptionRow({
  label,
  tooltip,
  checked,
  onCheckedChange,
  id,
  children,
}: {
  label: string;
  tooltip: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <Label htmlFor={id} className="text-sm cursor-pointer leading-snug">
            {label}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
          </Tooltip>
        </div>
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      {children}
    </div>
  );
}

export function OptionsPanel({
  activityType,
  options,
  isFirstYear,
  onOptionsChange,
  onFirstYearChange,
}: OptionsPanelProps) {
  function update<K extends keyof TaxOptions>(key: K, value: TaxOptions[K]) {
    onOptionsChange({ ...options, [key]: value });
  }

  const vlRate = VERSEMENT_LIBERATOIRE_RATES[activityType];

  return (
    <div className="space-y-4">
      <OptionRow
        id="acre"
        label="Bénéficier de l'ACRE"
        tooltip="L'ACRE (Aide à la Création ou Reprise d'Entreprise) réduit de 50% vos cotisations sociales pendant les 4 premiers trimestres civils d'activité."
        checked={options.hasACRE}
        onCheckedChange={(v) => update("hasACRE", v)}
      />

      <Separator />

      <OptionRow
        id="vl"
        label="Versement libératoire de l'IR"
        tooltip={`Payez votre impôt sur le revenu en même temps que vos cotisations, au taux fixe de ${formatPercent(vlRate)} sur votre CA. Avantageux si votre taux marginal d'imposition est élevé.`}
        checked={options.useVersementLiberatoire}
        onCheckedChange={(v) => update("useVersementLiberatoire", v)}
      />

      {!options.useVersementLiberatoire && (
        <div className="space-y-4 pl-1">
          <Separator />
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Calcul IR — Régime micro (barème progressif)
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="nb-parts" className="text-sm">
                  Quotient familial (parts fiscales)
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Célibataire sans enfant = 1 part. Couple marié/pacsé = 2
                    parts. +0,5 par enfant (1 à 2), puis +1 à partir du 3e.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update("nbParts", n)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                      options.nbParts === n
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-input bg-background hover:bg-muted"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="other-revenue" className="text-sm">
                  Autres revenus du foyer (annuel)
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Salaires, revenus fonciers, retraites… du foyer fiscal. Sert
                    au calcul du barème progressif de l'IR.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  id="other-revenue"
                  type="number"
                  min="0"
                  value={options.otherAnnualRevenue || ""}
                  onChange={(e) =>
                    update(
                      "otherAnnualRevenue",
                      Math.max(0, parseFloat(e.target.value) || 0)
                    )
                  }
                  placeholder="0"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  €
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      <OptionRow
        id="first-year"
        label="Première année d'activité"
        tooltip="Exonération de CFE (Cotisation Foncière des Entreprises) la première année de création."
        checked={isFirstYear}
        onCheckedChange={onFirstYearChange}
      />
    </div>
  );
}
