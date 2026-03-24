import { useState, useMemo } from "react";
import { Calculator, ArrowLeft, Sparkles } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivitySelector } from "@/components/ActivitySelector";
import { RevenueInput } from "@/components/RevenueInput";
import { OptionsPanel } from "@/components/OptionsPanel";
import { PurchaseManager } from "@/components/PurchaseManager";
import { TaxSummary } from "@/components/TaxSummary";
import { TaxBreakdown } from "@/components/TaxBreakdown";
import { computeTaxes } from "@/lib/taxCalculations";
import type { ActivityType, TaxOptions, Purchase } from "@/lib/types";

const DEFAULT_OPTIONS: TaxOptions = {
  hasACRE: false,
  useVersementLiberatoire: false,
  nbParts: 1,
  otherAnnualRevenue: 0,
};

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs text-white font-bold shadow-sm shadow-blue-500/30">
      {n}
    </span>
  );
}

export default function App() {
  const [activityType, setActivityType] = useState<ActivityType>("SERVICES_BIC");
  const [annualRevenue, setAnnualRevenue] = useState<number>(0);
  const [options, setOptions] = useState<TaxOptions>(DEFAULT_OPTIONS);
  const [isFirstYear, setIsFirstYear] = useState<boolean>(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const result = useMemo(
    () =>
      computeTaxes(
        { activityType, annualRevenue, options, purchases },
        isFirstYear
      ),
    [activityType, annualRevenue, options, purchases, isFirstYear]
  );

  const hasRevenue = annualRevenue > 0;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-dvh bg-background">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-border/60 bg-card/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
              <Calculator className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">
                Simulateur Auto-Entrepreneur
              </h1>
              <p className="text-xs text-muted-foreground">
                Cotisations & impôts — Taux 2026 (Urssaf)
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-semibold">
                2026
              </Badge>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left column — Inputs */}
            <div className="space-y-4">
              {/* Activity & Revenue */}
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <StepBadge n={1} />
                    Mon activité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ActivitySelector
                    value={activityType}
                    onChange={(type) => {
                      setActivityType(type);
                      setAnnualRevenue(0);
                    }}
                  />
                  <Separator />
                  <RevenueInput
                    activityType={activityType}
                    annualRevenue={annualRevenue}
                    onAnnualRevenueChange={setAnnualRevenue}
                  />
                </CardContent>
              </Card>

              {/* Options */}
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <StepBadge n={2} />
                    Options fiscales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OptionsPanel
                    activityType={activityType}
                    options={options}
                    isFirstYear={isFirstYear}
                    onOptionsChange={setOptions}
                    onFirstYearChange={setIsFirstYear}
                  />
                </CardContent>
              </Card>

              {/* Purchases */}
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <StepBadge n={3} />
                    Achats professionnels & TVA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PurchaseManager
                    purchases={purchases}
                    isVATRedevable={result.tva.isRedevable}
                    tvaThreshold={result.tva.threshold}
                    annualRevenue={annualRevenue}
                    onPurchasesChange={setPurchases}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right column — Results */}
            <div className="space-y-4">
              {!hasRevenue ? (
                <div className="flex flex-col items-center justify-center min-h-72 rounded-2xl bg-gradient-to-br from-blue-500/8 to-indigo-500/8 border border-blue-200/50 dark:border-blue-800/40 text-center p-8">
                  <div className="relative mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                      <Calculator className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                      <Sparkles className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <p className="text-base font-bold text-foreground">
                    Votre simulation fiscale
                  </p>
                  <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
                    Entrez votre chiffre d'affaires pour voir vos cotisations, impôts et revenu net en temps réel.
                  </p>
                  <div className="flex items-center gap-1.5 mt-5 text-xs text-muted-foreground bg-muted/70 rounded-full px-3 py-1.5 font-medium">
                    <ArrowLeft className="h-3 w-3" />
                    <span>Commencez par l'étape 1</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        Synthèse annuelle
                        <Badge variant="secondary" className="text-xs font-normal ml-auto">
                          En temps réel
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TaxSummary
                        result={result}
                        activityType={activityType}
                        hasACRE={options.hasACRE}
                      />
                    </CardContent>
                  </Card>

                  {/* Detailed breakdown */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Détail du calcul
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TaxBreakdown
                        result={result}
                        activityType={activityType}
                      />
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </main>

        <footer className="border-t border-border/60 mt-8">
          <div className="max-w-6xl mx-auto px-4 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              Calculs basés sur les taux en vigueur en 2026 — Source :{" "}
              <a
                href="https://www.autoentrepreneur.urssaf.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Urssaf
              </a>{" "}
              &amp;{" "}
              <a
                href="https://www.impots.gouv.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                impots.gouv.fr
              </a>
              . Ces résultats sont indicatifs et ne constituent pas un conseil fiscal.
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
