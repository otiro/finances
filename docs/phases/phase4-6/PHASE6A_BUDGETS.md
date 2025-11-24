# Phase 6A - Budgets - Plan Détaillé

## 🎯 Vue d'ensemble

Implémenter un **système complet de budgétisation** permettant aux utilisateurs de :
- Fixer des budgets par catégorie
- Suivre les dépenses en temps réel
- Visualiser la progression vs budget
- Recevoir des alertes de dépassement

**Durée estimée** : 2-3 semaines
**Complexité** : Moyenne
**Impact utilisateur** : Très Haut

---

## 📊 Modèle de Données

### Budget
```prisma
model Budget {
  id                String    @id @default(uuid())
  householdId       String    @map("household_id")
  categoryId        String    @map("category_id")

  name              String    // "Budget Alimentation"
  description       String?
  amount            Decimal   @db.Decimal(10, 2)  // Montant max
  period            String    // MONTHLY, QUARTERLY, YEARLY

  startDate         DateTime  @map("start_date")
  endDate           DateTime? @map("end_date")

  alertThreshold    Int       @default(80)  // % avant alerte (80%)
  alertEnabled      Boolean   @default(true) @map("alert_enabled")

  isActive          Boolean   @default(true) @map("is_active")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  // Relations
  household         Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  category          Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@map("budgets")
}

model BudgetTransaction {
  id                String    @id @default(uuid())
  budgetId          String    @map("budget_id")
  transactionId     String    @map("transaction_id")

  createdAt         DateTime  @default(now()) @map("created_at")

  // Relations
  budget            Budget    @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  transaction       Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)

  @@unique([budgetId, transactionId])
  @@map("budget_transactions")
}

model BudgetAlert {
  id                String    @id @default(uuid())
  budgetId          String    @map("budget_id")

  currentSpent      Decimal   @db.Decimal(10, 2)
  budgetAmount      Decimal   @db.Decimal(10, 2)
  percentageUsed    Decimal   @db.Decimal(5, 2)  // 0-100

  alertType         String    // THRESHOLD_REACHED, EXCEEDED
  createdAt         DateTime  @default(now()) @map("created_at")

  // Relations
  budget            Budget    @relation(fields: [budgetId], references: [id], onDelete: Cascade)

  @@map("budget_alerts")
}
```

---

## 🏗️ Architecture Backend

### Services Layer

#### `budgetService.ts` (~350 lignes)
```typescript
// Créer un budget
async createBudget(householdId, userId, data)
  - Vérifier accès household
  - Valider dates
  - Créer budget
  - Retourner avec dépenses actuelles

// Récupérer budgets avec progression
async getHouseholdBudgets(householdId, userId)
  - Récupérer tous budgets actifs
  - Calculer spent pour chaque (sum transactions)
  - Calculer pourcentage
  - Retourner avec état

// Mettre à jour budget
async updateBudget(budgetId, householdId, userId, data)
  - Vérifier accès
  - Mettre à jour
  - Vérifier pas d'alerte déjà levée

// Supprimer budget
async deleteBudget(budgetId, householdId, userId)
  - Vérifier accès
  - Supprimer (cascade relations)

// Obtenir détails budget avec historique transactions
async getBudgetDetails(budgetId, householdId, userId)
  - Budget info
  - Transactions associées
  - Historique alertes
  - Graphiques données

// Vérifier et lever alertes
async checkBudgetAlerts(budgetId)
  - Recalculer spent
  - Vérifier thresholds
  - Créer BudgetAlert si dépassé
  - Retourner état alerte
```

#### `budgetCalculationService.ts` (~200 lignes)
```typescript
// Calculer dépenses pour un budget
async calculateBudgetSpent(budgetId, period)
  - Récupérer budget
  - Récupérer transactions de la période
  - Filtrer par category + type DEBIT
  - Retourner somme

// Calculer projections futures
async projectBudgetSpending(budgetId, daysRemaining)
  - Dépenses actuelles
  - Jours restants dans période
  - Projection linéaire
  - Retourner si risque dépassement

// Comparer budgets
async compareBudgetPeriods(budgetId, previousPeriod, currentPeriod)
  - Spent précédente période
  - Spent période actuelle
  - Retourner variance %
```

### Controllers Layer

#### `budgetController.ts` (~400 lignes)
```typescript
// POST /api/households/:householdId/budgets
async createBudget()
  - Valider input Zod
  - Appeler service
  - Retourner 201 + budget

// GET /api/households/:householdId/budgets
async listBudgets()
  - Appeler service
  - Retourner tous avec progression

// GET /api/households/:householdId/budgets/:budgetId
async getBudgetDetail()
  - Appeler service
  - Retourner détails + transactions

// PATCH /api/households/:householdId/budgets/:budgetId
async updateBudget()
  - Valider input
  - Appeler service
  - Retourner budget mis à jour

// DELETE /api/households/:householdId/budgets/:budgetId
async deleteBudget()
  - Appeler service
  - Retourner 204

// GET /api/households/:householdId/budgets/:budgetId/alerts
async getBudgetAlerts()
  - Récupérer historique alertes
  - Trier par date DESC
  - Retourner
```

### Routes

```typescript
router.post('/:householdId/budgets', createBudget);
router.get('/:householdId/budgets', listBudgets);
router.get('/:householdId/budgets/:budgetId', getBudgetDetail);
router.patch('/:householdId/budgets/:budgetId', updateBudget);
router.delete('/:householdId/budgets/:budgetId', deleteBudget);
router.get('/:householdId/budgets/:budgetId/alerts', getBudgetAlerts);
```

### Validation (Zod)

```typescript
const createBudgetSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  amount: z.number().positive(),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.string().refine(val => !isNaN(Date.parse(val))),
  endDate: z.string().refine(val => !isNaN(Date.parse(val))).optional(),
  alertThreshold: z.number().min(1).max(100).optional().default(80),
  alertEnabled: z.boolean().optional().default(true),
});
```

---

## 🎨 Architecture Frontend

### Pages

#### `Budgets.tsx` (~200 lignes)
```
Layout:
  - Header: "Budgets" + Button "Créer un budget"
  - List de BudgetCard
  - Stats globales

Actions:
  - Créer nouveau
  - Voir détails
  - Éditer
  - Supprimer
```

### Composants

#### `BudgetForm.tsx` (~250 lignes)
```typescript
// Création/Édition formulaire
- Select catégorie
- Input nom
- Input montant
- Select période (MONTHLY/QUARTERLY/YEARLY)
- Date picker startDate
- Date picker endDate (optionnel)
- Slider seuil alerte (0-100)
- Toggle alerte active
- Validation Zod
```

#### `BudgetCard.tsx` (~200 lignes)
```typescript
// Card affichant un budget
- Nom + catégorie (couleur)
- Montant total
- ProgressBar (visuelle)
- Spent / Total (texte)
- Pourcentage
- Date période
- Status badge (GREEN/YELLOW/RED)
- Boutons éditer/supprimer
```

#### `BudgetProgressBar.tsx` (~100 lignes)
```typescript
// ProgressBar stylisée
- Fond gris (non utilisé)
- Barre colorée (utilisé)
- Alerte overlay si seuil
- Texte pourcentage
- Tooltip spent
```

#### `BudgetDetailDialog.tsx` (~300 lignes)
```
Layout:
  - Header: Budget name + stats
  - Tabs: Overview | Transactions | Alerts

Tab Overview:
  - Grande progress bar
  - Stats: Spent/Total/Remaining/Projected
  - Alerte seuil si active
  - Boutons: Éditer, Supprimer

Tab Transactions:
  - Liste des transactions de cette période
  - Filtrées par catégorie + DEBIT
  - Affichage: date, description, montant

Tab Alerts:
  - Historique des alertes (dernier mois)
  - Date + moment de l'alerte
```

#### `BudgetCreateDialog.tsx` (~150 lignes)
```
- BudgetForm
- Boutons: Créer, Annuler
- Validation complète
- Feedback utilisateur
```

#### `BudgetList.tsx` (~150 lignes)
```
- Grid ou List des budgets
- Tri par: nom, spent %, date
- Filtres: actifs/inactifs, période
- Responsive: 1-3 colonnes selon écran
```

### State Management (Redux)

#### `budgetSlice.ts` (~400 lignes)
```typescript
// State
budgets: Budget[]
selectedBudget: Budget | null
loading: boolean
error: string | null

// Async Thunks
fetchBudgets(householdId)
fetchBudgetDetail(budgetId, householdId)
createBudget(householdId, data)
updateBudget(budgetId, householdId, data)
deleteBudget(budgetId, householdId)
fetchBudgetAlerts(budgetId)

// Selectors
selectBudgets
selectBudgetById
selectBudgetSpent
selectBudgetPercentage
selectAlertStatus
selectTotalBudgeted
selectTotalSpent
```

### Services

#### `budgetService.ts` (~150 lignes)
```typescript
// API client
getBudgets(householdId): Promise<Budget[]>
getBudgetDetail(budgetId, householdId): Promise<BudgetDetail>
createBudget(householdId, data): Promise<Budget>
updateBudget(budgetId, householdId, data): Promise<Budget>
deleteBudget(budgetId, householdId): Promise<void>
getBudgetAlerts(budgetId): Promise<BudgetAlert[]>
```

---

## 📱 UI/UX Design

### Palette Couleurs
- **GREEN** (#4caf50) : < 60% utilisé
- **YELLOW** (#ff9800) : 60-80% utilisé
- **ORANGE** (#ff7043) : 80-95% utilisé
- **RED** (#f44336) : > 95% utilisé

### Responsive
- Desktop (1920px) : Grid 3 colonnes
- Tablet (768px) : Grid 2 colonnes
- Mobile (375px) : Grid 1 colonne

---

## 🧪 Testing (Phase 6A)

### Backend Tests (~30 cas)
- [x] Créer budget
- [x] Récupérer budgets
- [x] Éditer budget
- [x] Supprimer budget
- [x] Validation dates
- [x] Calcul spent correct
- [x] Alerte seuil
- [x] Accès householdId
- [x] Période invalide
- [x] Catégorie inexistante

### Frontend Tests (~25 cas)
- [x] Affichage liste budgets
- [x] Créer nouveau budget
- [x] Formulaire validation
- [x] Éditer budget
- [x] Supprimer avec confirmation
- [x] Progress bar color
- [x] Détails budget
- [x] Historique transactions
- [x] Historique alertes
- [x] Responsive design

---

## 📋 Fichiers à Créer/Modifier

### Backend
```
src/
├── services/
│   ├── budgetService.ts         (NEW, 350 lignes)
│   └── budgetCalculationService.ts (NEW, 200 lignes)
├── controllers/
│   └── budgetController.ts      (NEW, 400 lignes)
├── routes/
│   └── budgetRoutes.ts          (NEW, 50 lignes)
├── utils/
│   └── validators.ts            (MODIFY: ajouter budgetSchema)
└── index.ts                     (MODIFY: ajouter routes)

prisma/
└── schema.prisma                (MODIFY: ajouter 3 modèles)
```

### Frontend
```
src/
├── pages/
│   └── Budgets.tsx              (NEW, 200 lignes)
├── components/Budgets/
│   ├── BudgetForm.tsx           (NEW, 250 lignes)
│   ├── BudgetCard.tsx           (NEW, 200 lignes)
│   ├── BudgetProgressBar.tsx    (NEW, 100 lignes)
│   ├── BudgetDetailDialog.tsx   (NEW, 300 lignes)
│   ├── BudgetCreateDialog.tsx   (NEW, 150 lignes)
│   └── BudgetList.tsx           (NEW, 150 lignes)
├── store/slices/
│   └── budgetSlice.ts           (NEW, 400 lignes)
├── services/
│   └── budgetService.ts         (NEW, 150 lignes)
└── App.tsx                      (MODIFY: ajouter route)

Total: ~2,450 lignes
```

---

## 🔄 Intégration avec Phase 5

### Données Réutilisées
- `Transaction.categoryId` pour filtrer
- `Household.id` pour scope
- `Category` pour affichage

### Nouvelle Relation
```
Budget → Transactions (via BudgetTransaction)
Budget → BudgetAlert (historique)
```

### Pas de Breaking Changes
- Phase 5 transactions non modifiées
- Budgets sont facultatifs
- Coexistent avec patterns récurrents

---

## 📈 Performance

### Optimisations
- Index sur (budgetId, transactionId)
- Index sur (budgetId, createdAt)
- Caching budgets (5 min)
- Agrégations en DB (sum)

### Requêtes
- GET budgets : < 200ms
- GET budget detail : < 500ms (avec 100 transactions)
- POST create : < 300ms

---

## 🚀 Roadmap Phase 6A

### Semaine 1 : Backend
- [ ] Jour 1-2 : Prisma migrations
- [ ] Jour 3-4 : Services + Controllers
- [ ] Jour 5 : Tests backend

### Semaine 2 : Frontend
- [ ] Jour 1 : Pages + Routes
- [ ] Jour 2-3 : Composants
- [ ] Jour 4 : Redux state
- [ ] Jour 5 : Tests frontend

### Semaine 3 : Intégration & Polish
- [ ] Jour 1 : Responsive design
- [ ] Jour 2-3 : UX improvements
- [ ] Jour 4 : Documentation
- [ ] Jour 5 : Déploiement test

---

## ✅ Critères de Succès Phase 6A

- [x] Tous endpoints fonctionnels
- [x] Tous cas de test passent
- [x] UI responsive (mobile/tablet/desktop)
- [x] Calculs corrects (spent, %)
- [x] Alertes génération correcte
- [x] Intégration Phase 5 OK
- [x] Documentation complète

---

**Phase 6A - Budgets est prêt à être implémenté** ✨

