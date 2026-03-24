# Simulateur de taxes Auto-Entrepreneur 2026

Application web qui calcule en temps réel les charges et impôts d'un auto-entrepreneur français pour l'année 2026.

## A quoi ca sert ?

En tant qu'auto-entrepreneur, il n'est pas toujours simple d'anticiper ce que vous allez réellement toucher une fois les cotisations sociales, l'impôt sur le revenu, la TVA et la CFE déduits de votre chiffre d'affaires.

Ce simulateur vous permet de :

- Estimer votre **revenu net** après toutes les charges
- Comparer les deux régimes d'imposition IR (barème progressif vs versement libératoire)
- Simuler l'impact de l'**ACRE** (exonération partielle la première année)
- Calculer votre **TVA récupérable** sur les achats professionnels si vous dépassez le seuil de franchise
- Visualiser le détail de chaque ligne de charges (cotisations, IR, CFE, TVA)

## Comment s'en servir ?

### 1. Choisir votre activité

Sélectionnez le type d'activité correspondant à votre situation :

| Activité | Taux de cotisations |
|---|---|
| Vente de marchandises | 12,3% |
| Services BIC | 21,2% |
| Liberal BNC (hors CIPAV) | 25,6% |
| Liberal CIPAV | 23,2% |

### 2. Saisir votre chiffre d'affaires

Entrez votre CA mensuel ou annuel (le simulateur convertit automatiquement). Un indicateur vous signale si vous approchez ou dépassez les plafonds légaux (203 100 € pour la vente, 83 600 € pour les services).

### 3. Configurer vos options

- **ACRE** : cochez si vous êtes dans vos 4 premiers trimestres d'activité (réduction de 50% des cotisations)
- **Versement libératoire** : imposition forfaitaire sur le CA (1% / 1,7% / 2,2% selon l'activité) — disponible si votre revenu fiscal de référence N-2 ne dépasse pas 29 315 € par part
- **Quotient familial** : indiquez votre nombre de parts fiscales pour un calcul IR plus précis
- **Autres revenus du foyer** : utile si vous êtes en barème progressif et que d'autres revenus s'ajoutent au foyer
- **Premiere annee d'activite** : exonère la CFE (Cotisation Foncière des Entreprises)

### 4. Ajouter vos achats professionnels

Si votre CA dépasse le seuil de franchise TVA (85 000 € vente / 37 500 € services), vous devenez redevable de la TVA. Dans ce cas, la TVA sur vos achats professionnels devient récupérable — ajoutez vos dépenses pour que le simulateur la déduise de votre total de charges.

### 5. Lire les résultats

- **Revenu net** : ce que vous touchez réellement
- **Total des charges** : cotisations + IR + CFE - TVA récupérable
- **Taux effectif global** : pourcentage de votre CA qui part en charges
- **Détail ligne par ligne** : chaque charge est visible et extensible (tranches IR affichées en barème progressif)

## Regles fiscales appliquees (2026)

Toutes les valeurs sont issues des barèmes Urssaf et impots.gouv.fr.

- Plafonds CA : 203 100 € (vente) / 83 600 € (services et libéral)
- Abattements forfaitaires : 71% (vente) / 50% (services BIC) / 34% (libéral)
- Tranches IR 2026 : 0% / 11% / 30% / 41% / 45%
- CFE : exonérée année 1 ou si CA ≤ 5 000 €, sinon 227 € (minimum national indicatif)
- TVA franchise : 85 000 € / 37 500 €

## Stack technique

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui (composants Radix UI)

## Lancer le projet en local

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # Build de production
npm run preview   # Prévisualiser le build
```

---

Realise par [Celavie Production](https://www.celavieproduction.com) — agence design & dev.
