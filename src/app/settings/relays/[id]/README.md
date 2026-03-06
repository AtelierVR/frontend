# Relay Layout Components

Structure du dossier pour la page de détails des relays.

## Structure

```
[id]/
├── components/          # Composants de visualisation
│   ├── CpuCoreGrid.tsx # Grille d'affichage des cœurs CPU
│   ├── NetworkBars.tsx # Barres upload/download réseau
│   ├── MiniChart.tsx   # Graphique linéaire historique
│   └── index.ts        # Exports regroupés
├── hooks/              # Hooks personnalisés
│   ├── useLerpedValue.ts # Animation par interpolation linéaire
│   └── index.ts        # Exports regroupés
├── utils/              # Fonctions utilitaires
│   ├── formatters.ts   # Formatage bytes, débit, CPU
│   └── index.ts        # Exports regroupés
└── layout.tsx          # Layout principal de la page
```

## Composants

### CpuCoreGrid
Affiche une barre verticale pour chaque cœur CPU avec hauteur proportionnelle à l'utilisation.

### NetworkBars
Affiche deux barres pour l'upload (orange) et le download (cyan).

### MiniChart
Graphique linéaire utilisant Chart.js pour afficher l'historique des métriques.

## Hooks

### useLerpedValue
Anime une valeur numérique avec interpolation linéaire.

### useLerpedSimpleArray
Anime un tableau de nombres avec interpolation linéaire.

## Utils

### formatBytes
Formate les bytes en unités lisibles (KB, MB, GB...).

### formatBytesPerSec
Formate le débit réseau en unités lisibles par seconde.

### calculateCpuAverage
Calcule la moyenne d'utilisation CPU à partir des cœurs.
