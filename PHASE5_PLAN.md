# 🚀 Phase 5: Plan de Développement Détaillé

**Date**: November 1, 2025
**Statut**: EN COURS
**Objectif**: Ajouter fonctionnalités avancées

---

## 🎯 Phase 5.1: Transactions Récurrentes

C'est par où on commence - la plus demandée et la plus utile!

### Fonctionnalité

Permettre de créer des transactions qui se répètent automatiquement:

```
Loyer 1500€ - Chaque 1er du mois
Abonnement Netflix 12€ - Chaque 10 du mois
Salaire 3000€ - Chaque dernier jour du mois
```

### Architecture

#### 1. **Base de Données (Prisma Schema)**

Ajouter 2 modèles:

```prisma
model RecurringPattern {
  id                String   @id @default(cuid())
  accountId         String
  account           Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)

  amount            Decimal
  type              TransactionType  // DEBIT ou CREDIT
  description       String
  categoryId        String?
  category          Category? @relation(fields: [categoryId], references: [id])

  // Récurrence
  frequency         String   // DAILY, WEEKLY, MONTHLY, YEARLY
  dayOfMonth        Int?     // Pour MONTHLY: 1-31, null=dernier jour
  dayOfWeek         Int?     // Pour WEEKLY: 0-6 (dimanche-samedi)
  startDate         DateTime
  endDate           DateTime?

  // Status
  isActive          Boolean  @default(true)
  lastGeneratedDate DateTime?
  nextGenerationDate DateTime

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([accountId])
}

model RecurringTransactionLog {
  id                String   @id @default(cuid())
  recurringPatternId String
  recurringPattern  RecurringPattern @relation(fields: [recurringPatternId], references: [id])

  generatedTransactionId String?  // Reference au transaction créée
  generatedDate     DateTime
  status            String   // SUCCESS, FAILED, SKIPPED
  errorMessage      String?

  createdAt         DateTime @default(now())

  @@index([recurringPatternId])
}
```

#### 2. **Backend Service**

File: `backend/src/services/recurringTransaction.service.ts`

```typescript
// Fonctions principales:
- createRecurringPattern()
- updateRecurringPattern()
- deleteRecurringPattern()
- getRecurringPatterns()
- getRecurringPatternById()
- generateNextTransactions()  // Cron job
- markRecurringPatternAsActive/Inactive()
```

#### 3. **Backend Controller**

File: `backend/src/controllers/recurringTransaction.controller.ts`

```typescript
// Routes:
POST   /api/accounts/:accountId/recurring
GET    /api/accounts/:accountId/recurring
GET    /api/accounts/:accountId/recurring/:patternId
PATCH  /api/accounts/:accountId/recurring/:patternId
DELETE /api/accounts/:accountId/recurring/:patternId
PATCH  /api/accounts/:accountId/recurring/:patternId/toggle
```

#### 4. **Backend Cron Job**

File: `backend/src/services/cronJobs.service.ts`

Exécuter chaque jour pour générer les transactions du jour:
```typescript
// Tous les jours à minuit
0 0 * * * → generateRecurringTransactions()
```

#### 5. **Frontend Service**

File: `frontend/src/services/recurringTransaction.service.ts`

```typescript
- createRecurringPattern()
- updateRecurringPattern()
- deleteRecurringPattern()
- getRecurringPatterns()
- toggleRecurringPattern()
```

#### 6. **Frontend Components**

**AddRecurringTransactionDialog.tsx**
```
Form avec:
- Montant
- Type (DEBIT/CREDIT)
- Description
- Catégorie
- Fréquence (Daily, Weekly, Monthly, Yearly)
  - Si Monthly: jour du mois (1-31 ou "dernier")
  - Si Weekly: jour de la semaine
- Date de début
- Date de fin (optionnelle)
```

**RecurringTransactionsList.tsx**
```
Table avec:
- Description
- Montant et type
- Fréquence
- Prochaine génération
- Actions (modifier, supprimer, pause)
```

**RecurringTransactionCard.tsx** (View/Edit)
```
Affiche:
- Détails du pattern
- Historique générations
- Actions
```

#### 7. **Frontend Pages**

Modifier `AccountDetails.tsx`:
```
Ajouter section:
- Tab "Transactions Récurrentes"
- Bouton "Ajouter Récurrence"
- Liste des patterns actifs
- Historique générations
```

---

## 📅 Implémentation Step-by-Step

### Jour 1: Backend Setup
- [ ] Migration Prisma (RecurringPattern, RecurringTransactionLog)
- [ ] Service: CRUD operations
- [ ] Service: Generation logic
- [ ] Controller: API endpoints
- [ ] Routes: API mapping
- [ ] Tests: Backend tests

**Durée**: 6-8 heures

### Jour 2: Cron Job & Validation
- [ ] Cron job service
- [ ] Transaction generation logic
- [ ] Error handling
- [ ] Logging et debugging
- [ ] Edge cases (dernier jour du mois, etc)

**Durée**: 4-6 heures

### Jour 3: Frontend Setup
- [ ] Service API
- [ ] Zustand store pour recurring patterns
- [ ] AddRecurringTransactionDialog
- [ ] RecurringTransactionsList

**Durée**: 6-8 heures

### Jour 4: Frontend UI & Integration
- [ ] AccountDetails page update
- [ ] RecurringTransactionCard
- [ ] Edit/Delete functionality
- [ ] Frontend tests

**Durée**: 4-6 heures

### Jour 5: Testing & Deployment
- [ ] Full end-to-end testing
- [ ] Edge case testing
- [ ] Documentation
- [ ] Deployment

**Durée**: 4-6 heures

---

## ✨ Features de Phase 5.1

### Frequencies Supportées
- ✅ Daily - Chaque jour
- ✅ Weekly - Chaque X semaine (lundi, mardi, etc)
- ✅ Monthly - Chaque mois (jour 1-31 ou dernier jour)
- ✅ Yearly - Chaque année (même date)

### Smart Features
- ✅ Gestion dernier jour du mois (30 vs 31)
- ✅ Pause/Reprendre pattern
- ✅ Historique générations
- ✅ Affichage "prochaine génération"
- ✅ Erreur handling si transaction échoue

### Validation
- ✅ Montant positif
- ✅ Date fin > date début
- ✅ Catégorie existe
- ✅ Compte accessible
- ✅ Fréquence valide

---

## 🔧 Technologie à Ajouter

### Backend
- **node-cron** - Pour les cron jobs
- Prisma (déjà là)

### Frontend
- React Hook Form (déjà là)
- Material-UI (déjà là)

---

## 📝 Documentation à Créer

- [ ] PHASE5_PROGRESS.md - Progression Phase 5
- [ ] TESTING_PHASE5.md - Tests Phase 5.1
- [ ] Docs API (endpoints)

---

## 🎯 Commit Strategy

```
1. Setup database schema
   commit: "feat: Add RecurringPattern model to schema"

2. Service CRUD operations
   commit: "feat: Implement recurring pattern CRUD service"

3. Generation logic
   commit: "feat: Add transaction generation logic"

4. Controller & Routes
   commit: "feat: Add recurring transaction API endpoints"

5. Cron job
   commit: "feat: Add cron job for transaction generation"

6. Frontend service
   commit: "feat: Add recurring transaction API client"

7. Frontend UI
   commit: "feat: Add recurring transaction UI components"

8. Integration & tests
   commit: "test: Add Phase 5.1 tests and documentation"
```

---

## 🚀 Ready to Code?

Everything is planned. Let's build Phase 5.1!

Next: Start with Prisma schema changes.
