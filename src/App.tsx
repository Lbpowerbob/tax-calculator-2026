import { useState, useMemo } from "react";
import { Calculator, ChevronRight } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Calculateur Auto-Entrepreneur
              </h1>
              <p className="text-xs text-muted-foreground">
                Cotisations & impôts — Taux 2026 (Urssaf)
              </p>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column — Inputs */}
            <div className="space-y-4">
              {/* Activity & Revenue */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-bold">
                      1
                    </span>
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
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-bold">
                      2
                    </span>
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
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-bold">
                      3
                    </span>
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
                <div className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-border text-center p-6">
                  <Calculator className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Entrez votre chiffre d'affaires
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Les résultats apparaîtront ici automatiquement
                  </p>
                  <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground/60">
                    <span>Renseignez l'étape 1</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Synthèse annuelle
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
                  <Card>
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

        <footer className="border-t border-border mt-8">
          <div className="max-w-6xl mx-auto px-4 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              Calculs basés sur les taux en vigueur en 2026 — Source :{" "}
              <a
                href="https://www.autoentrepreneur.urssaf.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Urssaf
              </a>{" "}
              &amp;{" "}
              <a
                href="https://www.impots.gouv.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
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
