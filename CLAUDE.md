# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Type-check (tsc -b) then bundle (vite build)
npm run lint      # ESLint
npm run preview   # Preview the production build locally
```

No test runner is configured.

## Architecture

Single-page React app (Vite + TypeScript). All state lives in `App.tsx` and is passed down as props — no global store. The result is recomputed via `useMemo` on every relevant state change.

**Data flow:**
```
App.tsx (state) → computeTaxes() → TaxSummary + TaxBreakdown (display)
```

### `src/lib/` — Pure logic, no React

- **`types.ts`** — All TypeScript interfaces (`TaxInput`, `TaxResult`, `ActivityType`, `Purchase`, etc.). Start here to understand the data model.
- **`constants.ts`** — All fiscal values for 2026: cotisation rates, versement libératoire rates, abattement rates, CA plafonds, TVA thresholds, IR tranches, CFE minimum. **Update this file when tax rates change.**
- **`taxCalculations.ts`** — `computeTaxes(input, isFirstYear)` is the single entry point. Calls four private functions: `computeCotisations`, `computeIRBareme` / `computeIRVersementLiberatoire`, `computeTVA`, `computeCFE`. Also exports `formatCurrency` and `formatPercent` (fr-FR locale).

### `src/components/ui/` — shadcn/ui components

Hand-written shadcn components (no CLI was used). Uses Radix UI primitives + `class-variance-authority`. The `cn()` helper is in `src/lib/utils.ts`. Tailwind CSS v4 with `@theme` variables defined in `src/index.css`.

### App-level components

- **`ActivitySelector`** — Drives `activityType` which gates every rate lookup in constants.
- **`RevenueInput`** — Stores display frequency (monthly/annual) locally; always emits annual revenue to parent.
- **`OptionsPanel`** — Controls ACRE, versement libératoire toggle, quotient familial (nb parts), other foyer revenue (for barème progressif), and first-year CFE exemption.
- **`PurchaseManager`** — Manages the `Purchase[]` list. TVA recovery is only active when `isVATRedevable` (CA > TVA threshold). Purchases do not affect cotisations or IR in the micro regime.
- **`TaxSummary`** — Four summary cards (net revenue, total taxes, effective rate, cotisation rate).
- **`TaxBreakdown`** — Line-by-line expandable breakdown. IR sub-items show tranches when in barème mode.

## French Tax Rules (2026)

Rates are sourced from Urssaf and impots.gouv.fr. All values live in `src/lib/constants.ts`.

**Cotisations sociales (applied to gross CA):**
- Vente marchandises: 12,3%
- Services BIC: 21,2%
- Libéral BNC (hors CIPAV): 25,6% ← raised in 2026 (was 24,6% in 2025)
- Libéral CIPAV: 23,2%

**ACRE:** 50% reduction on cotisations for the first 4 calendar quarters.

**IR — two modes:**
1. *Versement libératoire* (flat rate on CA): 1% / 1,7% / 2,2% depending on activity. Requires RFR ≤ 29 315 € per part in N-2.
2. *Barème progressif* (micro regime): abattement forfaitaire (71% / 50% / 34%, min 305 €) applied to CA, then standard IR tranches with quotient familial. The IR amount attributed to the AE activity is prorated when there are other foyer revenues.

**CA plafonds (2026–2028):** 203 100 € (vente), 83 600 € (services/libéral).

**TVA franchise thresholds:** 85 000 € / 37 500 € (normal seuil). Above threshold, TVA on purchases becomes recoverable — this feeds back into `totalTaxes` as a negative.

**CFE:** Exempt year 1, exempt if CA ≤ 5 000 €, otherwise 227 € (indicative national minimum — varies by commune).

**Important constraint:** In the micro regime, actual business expenses are never deductible from cotisations or IR. The abattement forfaitaire is the only deduction. This is why `PurchaseManager` only affects TVA recovery.
