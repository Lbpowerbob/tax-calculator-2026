import { useState } from "react";
import { Plus, Trash2, ShoppingCart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/taxCalculations";
import type { Purchase, TVARate } from "@/lib/types";

interface PurchaseManagerProps {
  purchases: Purchase[];
  isVATRedevable: boolean;
  tvaThreshold: number;
  annualRevenue: number;
  onPurchasesChange: (purchases: Purchase[]) => void;
}

const TVA_RATE_LABELS: Record<TVARate, string> = {
  0: "Exonéré (0%)",
  5.5: "Taux réduit (5,5%)",
  10: "Taux intermédiaire (10%)",
  20: "Taux normal (20%)",
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function PurchaseManager({
  purchases,
  isVATRedevable,
  tvaThreshold,
  annualRevenue,
  onPurchasesChange,
}: PurchaseManagerProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [tvaRate, setTvaRate] = useState<TVARate>(20);

  function handleAdd() {
    const amountNum = parseFloat(amount.replace(",", "."));
    if (!description.trim() || isNaN(amountNum) || amountNum <= 0) return;

    onPurchasesChange([
      ...purchases,
      { id: generateId(), description: description.trim(), amount: amountNum, tvaRate },
    ]);
    setDescription("");
    setAmount("");
  }

  function handleRemove(id: string) {
    onPurchasesChange(purchases.filter((p) => p.id !== id));
  }

  const totalTTC = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalRecoverableTVA = isVATRedevable
    ? purchases.reduce((sum, p) => {
        if (p.tvaRate === 0) return sum;
        return sum + (p.amount / (1 + p.tvaRate / 100)) * (p.tvaRate / 100);
      }, 0)
    : 0;

  return (
    <div className="space-y-4">
      {/* Info about deductions */}
      <div className="rounded-lg bg-muted/50 p-3 space-y-2">
        <div className="flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              En régime micro-entrepreneur, les charges réelles{" "}
              <strong>ne sont pas déductibles</strong> du calcul des cotisations
              ni de l'IR (l'abattement forfaitaire en tient lieu).
            </p>
            {isVATRedevable ? (
              <p className="text-green-700 dark:text-green-400">
                Votre CA dépasse le seuil TVA ({formatCurrency(tvaThreshold)}).
                Vous pouvez récupérer la TVA sur vos achats professionnels.
              </p>
            ) : (
              <p>
                Sous le seuil de franchise TVA ({formatCurrency(tvaThreshold)}),
                vous ne collectez pas la TVA et ne pouvez pas la récupérer.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add purchase form */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Ajouter un achat professionnel (TTC)
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="relative w-28">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Montant"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-6"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              €
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={String(tvaRate)}
            onValueChange={(v) => setTvaRate(parseFloat(v) as TVARate)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(TVA_RATE_LABELS) as [string, string][]).map(
                ([rate, label]) => (
                  <SelectItem key={rate} value={rate}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!description.trim() || !amount}
            size="icon"
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Purchase list */}
      {purchases.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {purchases.length} achat{purchases.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-1.5">
              {purchases.map((p) => {
                const tvaAmount =
                  isVATRedevable && p.tvaRate > 0
                    ? (p.amount / (1 + p.tvaRate / 100)) * (p.tvaRate / 100)
                    : 0;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{p.description}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-xs py-0">
                          TVA {p.tvaRate}%
                        </Badge>
                        {isVATRedevable && tvaAmount > 0 && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            TVA récup. : {formatCurrency(tvaAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-medium">
                        {formatCurrency(p.amount)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(p.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="rounded-md bg-muted/50 px-3 py-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total achats TTC</span>
                <span className="font-medium">{formatCurrency(totalTTC)}</span>
              </div>
              {isVATRedevable && totalRecoverableTVA > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400">
                    TVA déductible
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    − {formatCurrency(totalRecoverableTVA)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* TVA warning when approaching threshold */}
      {!isVATRedevable && annualRevenue > tvaThreshold * 0.8 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-3">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Attention : à partir de {formatCurrency(tvaThreshold)} de CA, vous
            devenez redevable de la TVA et pourrez récupérer la TVA sur vos
            achats.
          </p>
        </div>
      )}
    </div>
  );
}
