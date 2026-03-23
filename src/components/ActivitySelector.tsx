import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  ACTIVITY_LABELS,
  ACTIVITY_DESCRIPTIONS,
  COTISATIONS_RATES,
  PLAFONDS_CA,
} from "@/lib/constants";
import { formatCurrency, formatPercent } from "@/lib/taxCalculations";
import type { ActivityType } from "@/lib/types";

interface ActivitySelectorProps {
  value: ActivityType;
  onChange: (value: ActivityType) => void;
}

const ACTIVITY_TYPES: ActivityType[] = [
  "VENTE",
  "SERVICES_BIC",
  "LIBERAL_BNC",
  "LIBERAL_CIPAV",
];

export function ActivitySelector({ value, onChange }: ActivitySelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label htmlFor="activity-select" className="text-sm font-medium">
          Type d'activité
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            Le type d'activité détermine votre taux de cotisations sociales et
            votre plafond de chiffre d'affaires.
          </TooltipContent>
        </Tooltip>
      </div>

      <Select value={value} onValueChange={(v) => onChange(v as ActivityType)}>
        <SelectTrigger id="activity-select" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ACTIVITY_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {ACTIVITY_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="rounded-lg bg-muted/50 p-3 space-y-2">
        <p className="text-xs text-muted-foreground">
          {ACTIVITY_DESCRIPTIONS[value]}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="info">
            Cotisations : {formatPercent(COTISATIONS_RATES[value])}
          </Badge>
          <Badge variant="secondary">
            Plafond CA : {formatCurrency(PLAFONDS_CA[value])}
          </Badge>
        </div>
      </div>
    </div>
  );
}
