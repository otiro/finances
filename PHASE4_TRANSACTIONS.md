# Phase 4 : Gestion des Transactions - Plan

## 📋 Vue d'ensemble

La Phase 4 ajoute la gestion des **transactions** aux comptes. Les transactions permettent de tracker les dépenses et revenus, de calculer les soldes dynamiquement, et de générer les dettes entre membres.

## 🎯 Objectifs

1. **Backend**: Créer les endpoints pour ajouter/récupérer/supprimer des transactions
2. **Frontend**: Interface pour visualiser et ajouter des transactions
3. **Calcul des dettes**: Déterminer automatiquement qui doit combien à qui
4. **Soldes dynamiques**: Les soldes se calculent automatiquement selon les transactions

## 🏗️ Architecture

### Modèle Transaction (Prisma)
```prisma
model Transaction {
  id            String    @id @default(cuid())
  accountId     String    @db.VarChar(255)
  account       Account   @relation(fields: [accountId], references: [id], onDelete: Cascade)

  userId        String    @db.VarChar(255)  // Qui a effectué la transaction
  user          User      @relation(fields: [userId], references: [id])

  description   String?
  amount        Decimal   @db.Decimal(10, 2)
  type          TransactionType  // CREDIT ou DEBIT

  transactionDate DateTime  @default(now())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([accountId])
  @@index([userId])
}

enum TransactionType {
  DEBIT   // Dépense
  CREDIT  // Revenu
}
```

## 📡 Backend - Endpoints à créer

### Transactions
```
POST   /api/accounts/:accountId/transactions
GET    /api/accounts/:accountId/transactions
GET    /api/accounts/:accountId/transactions/:transactionId
PATCH  /api/accounts/:accountId/transactions/:transactionId
DELETE /api/accounts/:accountId/transactions/:transactionId
```

### Dettes (calculées)
```
GET    /api/households/:householdId/debts
```

## 🔧 Backend - Implémentation

### Services à créer
1. `backend/src/services/transaction.service.ts`
   - `createTransaction(accountId, userId, data)` - Ajouter une transaction
   - `getAccountTransactions(accountId, userId)` - Récupérer les transactions
   - `getTransactionById(transactionId, userId)` - Une transaction spécifique
   - `updateTransaction(transactionId, userId, data)` - Modifier
   - `deleteTransaction(transactionId, userId)` - Supprimer
   - `calculateDebts(householdId, userId)` - Calculer les dettes

### Controllers à créer
`backend/src/controllers/transaction.controller.ts`
- `createTransaction`
- `getAccountTransactions`
- `getTransactionById`
- `updateTransaction`
- `deleteTransaction`
- `getHouseholdDebts`

### Routes à créer
`backend/src/routes/transaction.routes.ts`
- Toutes les routes des endpoints listés ci-dessus

### Validateurs à ajouter
`backend/src/utils/validators.ts`
- `createTransactionSchema` - Validation création
- `updateTransactionSchema` - Validation modification

## 🎨 Frontend - Pages à créer

### 1. Page AccountTransactions (dans AccountDetails)
**Location**: `frontend/src/pages/AccountDetails.tsx` (modification existante)

**Fonctionnalités**:
- Afficher les 10 dernières transactions
- Bouton "Ajouter une transaction"
- Supprimer une transaction (si admin du foyer)
- Filtrer par type (CREDIT/DEBIT)

### 2. Dialog AddTransaction
**Location**: `frontend/src/components/AddTransactionDialog.tsx`

**Champs**:
- Description (optionnel)
- Montant (décimal)
- Type (CREDIT/DEBIT)
- Date (par défaut: aujourd'hui)

**Validation**:
- Montant > 0
- Type requis
- Appartient à un compte du foyer

### 3. Page Debts (vue globale des dettes)
**Location**: `frontend/src/pages/Debts.tsx`

**Fonctionnalités**:
- Afficher pour chaque foyer qui doit combien à qui
- Format simple: "Alice doit 50€ à Bob"
- Grouper par foyer
- Marquer une dette comme remboursée (optionnel, Phase 4.5)

## 📱 Frontend - Services

### transaction.service.ts
```typescript
- createTransaction(accountId, data)
- getAccountTransactions(accountId)
- getTransactionById(transactionId)
- updateTransaction(accountId, transactionId, data)
- deleteTransaction(accountId, transactionId)
- getHouseholdDebts(householdId)
```

### Store: transactionSlice.ts
```typescript
- transactions[]
- currentTransaction
- debts[] (for household)
- isLoading
- error

Actions:
- setTransactions
- addTransaction
- updateTransaction
- removeTransaction
- setDebts
```

## 🧮 Logique des Dettes

**Concept**: Calculer automatiquement qui doit combien à qui selon les transactions.

**Exemple**:
```
Compte "Shared": EQUAL mode, Alice & Bob propriétaires 50/50
Transactions:
  - Alice a payé 100€ (DEBIT)
  - Bob a payé 0€

Solde actuel: -100€
Dû par Alice: -50€ (elle a payé 50€ de trop)
Dû par Bob: +50€ (il doit rembourser sa part à Alice)

Résultat: Bob doit 50€ à Alice
```

**Calcul**:
1. Pour chaque compte JOINT:
   - Récupérer le solde (initialBalance + transactions)
   - Pour chaque propriétaire, calculer sa part: `solde * ownershipPercentage`
   - Comparer avec ce qu'il a déjà payé
   - Générer les dettes

## 🧪 Tests à effectuer

### Backend Tests
1. ✅ Créer une transaction (DEBIT)
2. ✅ Créer une transaction (CREDIT)
3. ✅ Récupérer les transactions d'un compte
4. ✅ Modifier une transaction
5. ✅ Supprimer une transaction
6. ✅ Calculer les dettes correctement
7. ✅ Vérifier les permissions (seul admin du foyer peut modifier)

### Frontend Tests
1. ✅ Naviguer à une page de compte avec transactions
2. ✅ Voir les transactions existantes
3. ✅ Ouvrir le dialog "Ajouter une transaction"
4. ✅ Créer une nouvelle transaction
5. ✅ Voir la transaction mise à jour immédiatement
6. ✅ Supprimer une transaction
7. ✅ Afficher la page des dettes
8. ✅ Vérifier que les dettes sont calculées correctement

## 📊 Exemple d'Utilisation Complet

```
Foyer: "Colocation" (EQUAL mode)
Membres: Alice, Bob, Charlie

Compte: "Charges mensuelles" (Alice 33.33%, Bob 33.33%, Charlie 33.33%)
Solde initial: 0€

Transactions:
1. Alice paie 300€ (DEBIT) -> Solde: -300€
2. Bob paie 100€ (DEBIT) -> Solde: -400€
3. Revenu 50€ (CREDIT) -> Solde: -350€

Chacun doit payer: -350 / 3 = -116.67€

Alice a payé: -300€, doit payer: -116.67€ → crédit de 183.33€
Bob a payé: -100€, doit payer: -116.67€ → doit 16.67€
Charlie a payé: 0€, doit payer: -116.67€ → doit 116.67€

Dettes:
- Bob doit 16.67€ à Alice
- Charlie doit 116.67€ à Alice
```

## 🚀 Plan d'Exécution

### Sprint 1: Backend Core
- [ ] Mettre à jour schema Prisma (ajouter Transaction)
- [ ] Créer transaction.service.ts
- [ ] Créer transaction.controller.ts
- [ ] Créer transaction.routes.ts
- [ ] Ajouter validateurs
- [ ] Tester les endpoints avec Postman/curl

### Sprint 2: Dettes
- [ ] Implémenter calculateDebts() dans transaction.service.ts
- [ ] Endpoint GET /api/households/:id/debts
- [ ] Tests du calcul des dettes

### Sprint 3: Frontend Core
- [ ] Créer transactionSlice.ts
- [ ] Créer transaction.service.ts
- [ ] Modifier AccountDetails.tsx pour afficher les transactions
- [ ] Créer AddTransactionDialog.tsx

### Sprint 4: Frontend Dettes & Polish
- [ ] Créer Debts.tsx (page globale)
- [ ] Tests complets frontend
- [ ] Optimisations et UX improvements

## 📝 Notes Techniques

- Les soldes se recalculent au runtime (pas de colonne dans DB)
- Les dettes se calculent aussi au runtime basé sur ownershipPercentage
- Une transaction ne peut être supprimée que par le créateur ou un admin du foyer
- Les montants sont en Decimal dans la DB (like initialBalance)
- Utiliser les mêmes patterns que Phase 3 (service layer, Zustand store, Material-UI)

## 🔒 Sécurité

- ✅ Vérifier que l'utilisateur est membre du foyer
- ✅ Vérifier que le compte appartient au foyer
- ✅ Seul admin du foyer peut modifier/supprimer
- ✅ Valider tous les montants (> 0, max 999999.99)
- ✅ Valider les dates (pas dans le futur)
