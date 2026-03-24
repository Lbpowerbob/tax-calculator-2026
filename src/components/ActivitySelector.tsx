import { Package, Wrench, BookOpen, Shield, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
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

const ACTIVITY_CONFIGS: Record<
  ActivityType,
  {
    icon: React.ElementType;
    short: string;
    desc: string;
    gradient: string;
    ring: string;
  }
> = {
  VENTE: {
    icon: Package,
    short: "Vente",
    desc: "Marchandises",
    gradient: "from-orange-500 to-amber-500",
    ring: "ring-orange-400",
  },
  SERVICES_BIC: {
    icon: Wrench,
    short: "Services BIC",
    desc: "Artisan / Commerçant",
    gradient: "from-blue-500 to-cyan-500",
    ring: "ring-blue-400",
  },
  LIBERAL_BNC: {
    icon: BookOpen,
    short: "Libéral BNC",
    desc: "Hors CIPAV",
    gradient: "from-violet-500 to-purple-600",
    ring: "ring-violet-400",
  },
  LIBERAL_CIPAV: {
    icon: Shield,
    short: "Libéral CIPAV",
    desc: "CIPAV",
    gradient: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-400",
  },
};

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
        <Label className="text-sm font-medium">Type d'activité</Label>
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

      <div className="grid grid-cols-2 gap-2">
        {ACTIVITY_TYPES.map((type) => {
          const config = ACTIVITY_CONFIGS[type];
          const Icon = config.icon;
          const isSelected = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={`relative flex flex-col gap-2 rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer
                ${
                  isSelected
                    ? `bg-gradient-to-br ${config.gradient} border-transparent text-white shadow-lg ring-2 ${config.ring} ring-offset-2 ring-offset-background scale-[1.02]`
                    : "bg-card border-border hover:border-primary/40 hover:shadow-md hover:scale-[1.01]"
                }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected
                    ? "bg-white/20"
                    : `bg-gradient-to-br ${config.gradient}`
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isSelected ? "text-white" : "text-white"}`}
                />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold leading-tight truncate ${
                    isSelected ? "text-white" : "text-foreground"
                  }`}
                >
                  {config.short}
                </p>
                <p
                  className={`text-xs leading-tight mt-0.5 ${
                    isSelected ? "text-white/75" : "text-muted-foreground"
                  }`}
                >
                  {config.desc}
                </p>
              </div>
              <div
                className={`text-xs font-bold tabular-nums ${
                  isSelected ? "text-white" : "text-primary"
                }`}
              >
                {formatPercent(COTISATIONS_RATES[type])}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 space-y-1.5">
        <p className="text-xs text-muted-foreground">
          {ACTIVITY_DESCRIPTIONS[value]}
        </p>
        <p className="text-xs text-muted-foreground/70">
          Plafond CA : <span className="font-medium text-foreground">{formatCurrency(PLAFONDS_CA[value])}</span>
        </p>
      </div>
    </div>
  );
}
