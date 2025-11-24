# Phase 6B - Analytiques & Rapports - Plan Détaillé

## 🎯 Vue d'ensemble

Implémenter un **système d'analytiques avancée** permettant aux utilisateurs de :
- Visualiser les dépenses avec graphiques (pie, bar, line)
- Générer des rapports exportables (PDF, CSV)
- Analyser les tendances temporelles
- Comparer périodes
- Faire des projections

**Durée estimée** : 3-4 semaines
**Complexité** : Élevée
**Impact utilisateur** : Très Haut
**Dépend de** : Phase 5 (données transactions)

---

## 📊 Modèle de Données

### Analytics Models
```prisma
model AnalyticsSnapshot {
  id                String    @id @default(uuid())
  householdId       String    @map("household_id")

  period            String    // 2025-11 (YYYY-MM)
  periodType        String    // MONTHLY, QUARTERLY, YEARLY

  totalIncome       Decimal   @db.Decimal(10, 2)
  totalExpense      Decimal   @db.Decimal(10, 2)
  netCashFlow       Decimal   @db.Decimal(10, 2)

  createdAt         DateTime  @default(now()) @map("created_at")

  // Relations
  household         Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  details           AnalyticsDetail[]

  @@unique([householdId, period])
  @@map("analytics_snapshots")
}

model AnalyticsDetail {
  id                String    @id @default(uuid())
  snapshotId        String    @map("snapshot_id")
  categoryId        String    @map("category_id")

  amount            Decimal   @db.Decimal(10, 2)
  type              String    // INCOME, EXPENSE
  transactionCount  Int

  @@map("analytics_details")
}

model ExportLog {
  id                String    @id @default(uuid())
  householdId       String    @map("household_id")
  userId            String    @map("user_id")

  format            String    // PDF, CSV, XLSX
  periodStart       DateTime  @map("period_start")
  periodEnd         DateTime  @map("period_end")

  fileName          String
  fileSize          Int       // Bytes
  downloadUrl       String?   @map("download_url")

  createdAt         DateTime  @default(now()) @map("created_at")

  // Relations
  household         Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("export_logs")
}
```

---

## 🏗️ Architecture Backend

### Services Layer

#### `analyticsService.ts` (~400 lignes)
```typescript
// Obtenir breakdown par catégorie
async getCategoryBreakdown(householdId, userId, startDate, endDate)
  - Récupérer transactions de période
  - Grouper par categoryId
  - Calculer sommes par type (DEBIT/CREDIT)
  - Calculer pourcentages
  - Retourner structure { categories: [...] }

// Obtenir données mensuelles
async getMonthlySpendings(householdId, userId, months=12)
  - Récupérer transactions par mois
  - Grouper par mois + type
  - Calculer totaux mensuels
  - Retourner structure { months: [...] }

// Obtenir tendances catégories
async getCategoryTrends(householdId, userId, categoryId, months=12)
  - Récupérer transactions catégorie
  - Grouper par mois
  - Calculer moyenne, min, max
  - Retourner structure { data: [...] }

// Obtenir comparaison périodes
async comparePeriods(householdId, userId, period1Start, period1End, period2Start, period2End)
  - Calculs période 1
  - Calculs période 2
  - Comparer variances
  - Retourner structure { period1: {...}, period2: {...}, comparison: {...} }

// Générer snapshot analytique
async generateSnapshot(householdId, period: "2025-11")
  - Calculer totaux mois
  - Créer AnalyticsSnapshot
  - Créer AnalyticsDetail pour chaque catégorie
  - Retourner snapshot

// Obtenir historique snapshots
async getSnapshotHistory(householdId, userId, months=12)
  - Récupérer snapshots derniers N mois
  - Trier par date DESC
  - Retourner liste
```

#### `reportService.ts` (~350 lignes)
```typescript
// Générer rapport PDF
async generatePDF(householdId, userId, startDate, endDate)
  - Récupérer données analytiques
  - Créer document PDF (pdfkit ou similar)
  - Ajouter: header, title, graphiques (as images), tables
  - Sauvegarder en /reports
  - Retourner path

// Générer rapport CSV
async generateCSV(householdId, userId, startDate, endDate)
  - Récupérer transactions
  - Formater en CSV
  - Ajouter headers: date, description, catégorie, montant, type
  - Sauvegarder en /reports
  - Retourner path

// Générer rapport XLSX
async generateXLSX(householdId, userId, startDate, endDate)
  - Récupérer données
  - Créer workbook (xlsx library)
  - Feuille 1: Récapitulatif
  - Feuille 2: Transactions détail
  - Feuille 3: Analyse par catégorie
  - Sauvegarder
  - Retourner path

// Enregistrer export
async logExport(householdId, userId, format, startDate, endDate, filePath)
  - Créer ExportLog
  - Enregistrer timestamp

// Lister exports
async getExportHistory(householdId, userId, limit=20)
  - Récupérer logs récents
  - Retourner liste avec download URLs
```

#### `projectionService.ts` (~250 lignes)
```typescript
// Projeter dépenses futures
async projectExpenses(householdId, userId, categoryId?, monthsAhead=3)
  - Récupérer historique 6-12 mois
  - Calculer moyenne mensuelle
  - Tenir compte récurrences (Phase 5)
  - Projeter futur linéairement
  - Retourner { projected: [...], confidence: 0.85 }

// Détecter anomalies
async detectAnomalies(householdId, userId, sensitivity=1.5)
  - Récupérer transactions dernière semaine
  - Comparer à moyenne hebdo
  - Identifier outliers (dépenses > moyenne * sensitivity)
  - Retourner { anomalies: [...] }

// Recommandations budget
async suggestBudgets(householdId, userId)
  - Analyser historique 3 mois
  - Par catégorie, calculer: avg + 10%
  - Suggérer budgets (phase 6A)
  - Retourner { suggestions: [...] }
```

### Controllers Layer

#### `analyticsController.ts` (~500 lignes)
```typescript
// GET /api/households/:householdId/analytics/breakdown
async getCategoryBreakdown()
  - Query params: startDate, endDate
  - Appeler service
  - Retourner data

// GET /api/households/:householdId/analytics/monthly
async getMonthlySpendings()
  - Query params: months (default: 12)
  - Appeler service
  - Retourner data

// GET /api/households/:householdId/analytics/trends/:categoryId
async getCategoryTrends()
  - Query params: months (default: 12)
  - Appeler service
  - Retourner data

// GET /api/households/:householdId/analytics/compare
async comparePeriods()
  - Query params: period1Start, period1End, period2Start, period2End
  - Appeler service
  - Retourner data

// GET /api/households/:householdId/analytics/snapshot/:period
async getSnapshot()
  - Path param: period (YYYY-MM)
  - Récupérer ou générer
  - Retourner data

// GET /api/households/:householdId/analytics/snapshots
async getSnapshotHistory()
  - Query params: months (default: 12)
  - Appeler service
  - Retourner liste

// POST /api/households/:householdId/reports/generate
async generateReport()
  - Body: format (pdf, csv, xlsx), startDate, endDate
  - Appeler reportService
  - Retourner download URL

// GET /api/households/:householdId/reports/history
async getReportHistory()
  - Retourner historique exports

// GET /api/households/:householdId/analytics/projections
async getProjections()
  - Query params: categoryId, monthsAhead
  - Appeler projectionService
  - Retourner projections

// GET /api/households/:householdId/analytics/anomalies
async getAnomalies()
  - Query params: sensitivity (default: 1.5)
  - Appeler projectionService
  - Retourner anomalies

// GET /api/households/:householdId/analytics/suggestions/budgets
async suggestBudgets()
  - Appeler projectionService
  - Retourner suggestions
```

### Routes
```typescript
router.get('/:householdId/analytics/breakdown', getCategoryBreakdown);
router.get('/:householdId/analytics/monthly', getMonthlySpendings);
router.get('/:householdId/analytics/trends/:categoryId', getCategoryTrends);
router.get('/:householdId/analytics/compare', comparePeriods);
router.get('/:householdId/analytics/snapshot/:period', getSnapshot);
router.get('/:householdId/analytics/snapshots', getSnapshotHistory);
router.post('/:householdId/reports/generate', generateReport);
router.get('/:householdId/reports/history', getReportHistory);
router.get('/:householdId/analytics/projections', getProjections);
router.get('/:householdId/analytics/anomalies', getAnomalies);
router.get('/:householdId/analytics/suggestions/budgets', suggestBudgets);
```

### Dependencies
```json
{
  "pdfkit": "^0.13.0",       // PDF generation
  "fast-csv": "^4.3.0",      // CSV generation
  "xlsx": "^0.18.5",         // XLSX generation
  "chart.js": "^4.0.0"       // Chart data structures
}
```

---

## 🎨 Architecture Frontend

### Pages

#### `Analytics.tsx` (~250 lignes)
```
Layout:
  - Header: "Analytiques" + Filter (date range)
  - Grid de charts
  - Actions: Export, Suggestions

Sections:
  1. Overview (stats cards)
  2. Breakdown par catégorie
  3. Tendances mensuelles
  4. Comparaison périodes
  5. Projections futures
```

#### `Reports.tsx` (~200 lignes)
```
Layout:
  - Header: "Rapports"
  - Form générer rapport (format + dates)
  - Liste historique downloads

Fonctionnalités:
  - Select format (PDF, CSV, XLSX)
  - Date pickers
  - Bouton générer
  - Progress loading
  - Historique avec dates + tailles
```

### Composants

#### `Charts/CategoryBreakdownChart.tsx` (~150 lignes)
```typescript
// Pie chart dépenses par catégorie
- Utilise Recharts
- Données: [{ name: "Alimentation", value: 450, percent: 30 }, ...]
- Couleurs: catégorie colors
- Legend cliquable
- Hover: % et montant
```

#### `Charts/MonthlySpendings.tsx` (~150 lignes)
```typescript
// Line chart dépenses mensuelles
- Utilise Recharts
- 2 lignes: Income (vert), Expense (rouge)
- X: mois (format court: "Nov", "Déc")
- Y: montants
- Tooltip: date + montants
```

#### `Charts/CategoryTrendsChart.tsx` (~150 lignes)
```typescript
// Bar chart comparaison mois pour 1 catégorie
- Utilise Recharts
- X: mois
- Y: montants
- Barre uniquement couleur catégorie
- Stats: min, max, avg
```

#### `Charts/ComparisonChart.tsx` (~150 lignes)
```typescript
// Grouped bar chart 2 périodes
- Périodes side by side
- Catégories en barres
- Highlight différences
```

#### `AnalyticsOverviewCards.tsx` (~150 lignes)
```typescript
// 4 cards affichant:
  1. Total Income (current month)
  2. Total Expense (current month)
  3. Net CashFlow
  4. Savings Rate %
```

#### `ProjectionWidget.tsx` (~150 lignes)
```typescript
// Widget affichant projections
- Select catégorie
- Affiche: historique + projection
- Mini chart
- Confiance niveau
```

#### `AnomaliesAlert.tsx` (~100 lignes)
```typescript
// Card affichant anomalies détectées
- Liste dépenses anormales
- Percentage écart
- Catégorie color
```

#### `ReportGenerator.tsx` (~200 lignes)
```typescript
// Form générer rapport
- Select format (PDF, CSV, XLSX)
- Date range pickers
- Bouton "Générer"
- Progress bar pendant génération
- Lien download si succès
```

#### `ReportHistory.tsx` (~150 lignes)
```typescript
// Tableau historique exports
- Colonnes: date, format, taille, action (download)
- Tri par date DESC
- Pagination (20 par page)
```

### State Management (Redux)

#### `analyticsSlice.ts` (~450 lignes)
```typescript
// State
categoryBreakdown: { ... }
monthlySpendings: { ... }
snapshots: Snapshot[]
selectedSnapshot: Snapshot | null
projections: { ... }
anomalies: Anomaly[]
suggestions: BudgetSuggestion[]
loading: boolean
error: string | null

// Async Thunks
fetchCategoryBreakdown(householdId, startDate, endDate)
fetchMonthlySpendings(householdId, months)
fetchCategoryTrends(householdId, categoryId, months)
fetchComparison(householdId, period1, period2)
fetchSnapshots(householdId, months)
generateReport(householdId, format, startDate, endDate)
fetchReportHistory(householdId)
fetchProjections(householdId, categoryId)
fetchAnomalies(householdId)
fetchBudgetSuggestions(householdId)

// Selectors
selectCategoryBreakdown
selectMonthlySpendings
selectSnapshots
selectProjections
selectAnomalies
selectSuggestions
selectTotalIncome(month)
selectTotalExpense(month)
```

### Services

#### `analyticsService.ts` (~200 lignes)
```typescript
// API client
getCategoryBreakdown(householdId, startDate, endDate)
getMonthlySpendings(householdId, months)
getCategoryTrends(householdId, categoryId, months)
comparePeriods(householdId, period1, period2)
getSnapshot(householdId, period)
getSnapshotHistory(householdId, months)
generateReport(householdId, format, startDate, endDate)
getReportHistory(householdId)
getProjections(householdId, categoryId)
getAnomalies(householdId)
suggestBudgets(householdId)
```

### UI Components

#### `DateRangeFilter.tsx` (~100 lignes)
```typescript
// Sélecteur période
- Quick options: This Month, Last 3 Months, Last Year
- Custom date range (2 date pickers)
- Bouton appliquer
- Callback onChange
```

#### `ExportButton.tsx` (~80 lignes)
```typescript
// Bouton export
- Menu déroulant: PDF, CSV, XLSX
- Select dates
- Loading state
- Success toast après
```

---

## 📚 Charting Library

**Choix recommandé** : **Recharts**
- Léger (~50KB)
- React-friendly
- Responsive natif
- Documentation excellente
- MIT license

**Alternative** : Chart.js
- Plus populaire
- Heavier (~75KB)
- Besoin wrapper React

---

## 📄 Export Libraries

### PDF: pdfkit
```typescript
const pdf = new PDFDocument();
pdf.text('Rapport Finances - Nov 2025', 100, 100);
pdf.moveTo(100, 150).lineTo(500, 150).stroke();
pdf.addPage().text('...');
pdf.pipe(fs.createWriteStream('/reports/report.pdf'));
```

### CSV: fast-csv
```typescript
const csv = format({ headers: true });
data.forEach(row => csv.write(row));
csv.pipe(fs.createWriteStream('/reports/report.csv'));
```

### XLSX: xlsx
```typescript
const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Transactions");
XLSX.writeFile(wb, '/reports/report.xlsx');
```

---

## 📊 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ANALYTIQUES                    [Date Range Filter] [Export]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Total Income  │  │Total Expense │  │Net CashFlow  │          │
│  │$45,000       │  │$32,000       │  │$13,000       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌────────────────────────┐  ┌────────────────────────┐         │
│  │ Breakdown Catégories   │  │ Tendances Mensuelles   │         │
│  │   Alimentation 30%     │  │ ╱╲  ╱╲   ╱╲            │         │
│  │   Logement 25%         │  │╱  ╲╱  ╲ ╱  ╲           │         │
│  │   Transport 20%        │  │     Revenus/Dépenses   │         │
│  │   Autre 25%            │  │                        │         │
│  └────────────────────────┘  └────────────────────────┘         │
│                                                                  │
│  ┌────────────────────────┐  ┌────────────────────────┐         │
│  │ Projections Futures    │  │ Anomalies Détectées    │         │
│  │ Alimentation: +15%     │  │ Achat électro: $850 !  │         │
│  │ Logement: stable       │  │ (3x moyenne)           │         │
│  └────────────────────────┘  └────────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing (Phase 6B)

### Backend Tests (~40 cas)
- [x] Breakdown par catégorie
- [x] Calculs montants corrects
- [x] Pourcentages exacts
- [x] Données mensuelles
- [x] Tendances catégories
- [x] Comparaison périodes
- [x] Snapshots création
- [x] PDF génération
- [x] CSV génération
- [x] XLSX génération
- [x] Projections
- [x] Détection anomalies
- [x] Suggestions budgets

### Frontend Tests (~30 cas)
- [x] Charts render
- [x] Données correctes
- [x] Responsive charts
- [x] Date range filter
- [x] Export dialog
- [x] Report history
- [x] Loading states
- [x] Error handling

---

## 📈 Performance

### Optimisations
- Cache snapshots (1h)
- Agrégations en DB (group by)
- Lazy load charts
- Pagination rapports

### Requêtes
- GET breakdown : < 500ms
- GET monthly : < 300ms
- Generate PDF : < 2s
- Generate CSV : < 1s

---

## 📋 Fichiers à Créer/Modifier

### Backend (~1,500 lignes)
```
src/
├── services/
│   ├── analyticsService.ts      (NEW, 400 lignes)
│   ├── reportService.ts         (NEW, 350 lignes)
│   └── projectionService.ts     (NEW, 250 lignes)
├── controllers/
│   └── analyticsController.ts   (NEW, 500 lignes)
├── routes/
│   └── analyticsRoutes.ts       (NEW, 50 lignes)
└── index.ts                     (MODIFY: routes)

prisma/
└── schema.prisma                (MODIFY: 3 models)
```

### Frontend (~1,800 lignes)
```
src/
├── pages/
│   ├── Analytics.tsx            (NEW, 250 lignes)
│   └── Reports.tsx              (NEW, 200 lignes)
├── components/Analytics/
│   ├── AnalyticsOverviewCards.tsx (NEW, 150 lignes)
│   ├── DateRangeFilter.tsx      (NEW, 100 lignes)
│   ├── ProjectionWidget.tsx     (NEW, 150 lignes)
│   ├── AnomaliesAlert.tsx       (NEW, 100 lignes)
│   └── ReportGenerator.tsx      (NEW, 200 lignes)
├── components/Charts/
│   ├── CategoryBreakdownChart.tsx (NEW, 150 lignes)
│   ├── MonthlySpendings.tsx     (NEW, 150 lignes)
│   ├── CategoryTrendsChart.tsx  (NEW, 150 lignes)
│   └── ComparisonChart.tsx      (NEW, 150 lignes)
├── store/slices/
│   └── analyticsSlice.ts        (NEW, 450 lignes)
├── services/
│   └── analyticsService.ts      (NEW, 200 lignes)
└── App.tsx                      (MODIFY: routes)

Total: ~3,300 lignes
```

---

## 🚀 Roadmap Phase 6B

### Semaine 1 : Backend Analytiques
- [ ] Jour 1-2 : Services
- [ ] Jour 3 : Controllers
- [ ] Jour 4-5 : Tests

### Semaine 2 : Backend Reports
- [ ] Jour 1-2 : Report generation
- [ ] Jour 3-4 : Export formats
- [ ] Jour 5 : Tests

### Semaine 3 : Frontend Charts
- [ ] Jour 1-2 : Pages
- [ ] Jour 3-4 : Components
- [ ] Jour 5 : Redux state

### Semaine 4 : Frontend Reports & Polish
- [ ] Jour 1-2 : Reports page
- [ ] Jour 3 : Responsive
- [ ] Jour 4 : Documentation
- [ ] Jour 5 : Déploiement test

---

## ✅ Critères de Succès Phase 6B

- [x] Tous endpoints fonctionnels
- [x] Tous charts affichent correctement
- [x] Exports (PDF, CSV, XLSX) générés OK
- [x] Données exactes (% corrects, sommes)
- [x] Responsive design
- [x] Intégration Phase 5 & 6A OK
- [x] Performance acceptable
- [x] Documentation complète

---

**Phase 6B - Analytiques est prêt à être implémenté** ✨

