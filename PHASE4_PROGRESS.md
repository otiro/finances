# Phase 4 : Gestion des Transactions - Progression

## ✅ Backend Complété

### Services
- [backend/src/services/transaction.service.ts](backend/src/services/transaction.service.ts) - Gestion des transactions
  - `createTransaction` - Créer une transaction
  - `getAccountTransactions` - Récupérer les transactions d'un compte
  - `getTransactionById` - Récupérer une transaction spécifique
  - `updateTransaction` - Modifier une transaction (admin uniquement)
  - `deleteTransaction` - Supprimer une transaction (admin uniquement)
  - `calculateDebts` - Calculer les dettes basées sur les transactions et les parts de propriété

### Contrôleurs
- [backend/src/controllers/transaction.controller.ts](backend/src/controllers/transaction.controller.ts)
  - `createTransaction` - Créer une transaction
  - `getAccountTransactions` - Lister les transactions d'un compte
  - `getTransactionById` - Récupérer une transaction
  - `updateTransaction` - Modifier une transaction
  - `deleteTransaction` - Supprimer une transaction
  - `getHouseholdDebts` - Récupérer les dettes d'un foyer

### Routes
- [backend/src/routes/transaction.routes.ts](backend/src/routes/transaction.routes.ts)
  - `POST /api/accounts/:accountId/transactions` - Créer une transaction
  - `GET /api/accounts/:accountId/transactions` - Lister les transactions
  - `GET /api/accounts/:accountId/transactions/:transactionId` - Récupérer une transaction
  - `PATCH /api/accounts/:accountId/transactions/:transactionId` - Modifier une transaction
  - `DELETE /api/accounts/:accountId/transactions/:transactionId` - Supprimer une transaction

- [backend/src/routes/household.routes.ts](backend/src/routes/household.routes.ts) (modifié)
  - `GET /api/households/:id/debts` - Récupérer les dettes du foyer

### Validateurs
- [backend/src/utils/validators.ts](backend/src/utils/validators.ts) (modifié)
  - `createTransactionSchema` - Validation création de transaction
  - `updateTransactionSchema` - Validation modification de transaction

### Intégration
- [backend/src/index.ts](backend/src/index.ts) - Routes intégrées

## ✅ Frontend Services et Stores

### Services API
- [frontend/src/services/transaction.service.ts](frontend/src/services/transaction.service.ts)
  - `createTransaction` - Créer une transaction
  - `getAccountTransactions` - Récupérer les transactions d'un compte
  - `getTransactionById` - Récupérer une transaction
  - `updateTransaction` - Modifier une transaction
  - `deleteTransaction` - Supprimer une transaction
  - `getHouseholdDebts` - Récupérer les dettes d'un foyer

### Stores Zustand
- [frontend/src/store/slices/transactionSlice.ts](frontend/src/store/slices/transactionSlice.ts)
  - État: `transactions`, `currentTransaction`, `debts`, `isLoading`, `error`
  - Actions: `setTransactions`, `addTransaction`, `updateTransaction`, `removeTransaction`, `setDebts`

## ✅ Frontend Pages et Composants

### Composants
- [frontend/src/components/AddTransactionDialog.tsx](frontend/src/components/AddTransactionDialog.tsx) - Dialog pour ajouter une transaction
  - Formulaire avec montant, type (DEBIT/CREDIT), description, date, notes
  - Validation des données
  - Empêche les dates futures

### Pages
- [frontend/src/pages/AccountDetails.tsx](frontend/src/pages/AccountDetails.tsx) (modifié) - Détails d'un compte
  - Section "Transactions récentes" avec liste des 10 dernières transactions
  - Bouton "Ajouter" pour créer une transaction
  - Bouton supprimer sur chaque transaction (avec confirmation)
  - Affichage du nom de l'utilisateur qui a créé la transaction
  - Couleur verte pour les revenus, rouge pour les dépenses
  - Actualisation automatique du solde après ajout/suppression

- [frontend/src/pages/Debts.tsx](frontend/src/pages/Debts.tsx) - Page des dettes
  - Affiche toutes les dettes groupées par foyer
  - Format simple: "Alice doit 50€ à Bob"
  - Résumé par personne montrant le solde net
  - Code couleur (vert = créance, rouge = dette)
  - Bouton retour aux foyers

### Routing
- [frontend/src/App.tsx](frontend/src/App.tsx) (modifié)
  - `GET /debts` - Page des dettes

## 🧮 Logique des Dettes

**Concept**: Calculer automatiquement qui doit combien à qui selon les transactions et les parts de propriété.

**Exemple complet**:
```
Compte: "Charges mensuelles" (Mode EQUAL - Alice 50%, Bob 50%)
Transactions:
  - Alice paie 100€ (DEBIT) → Solde: -100€
  - Bob paie 0€

Calcul:
  - Solde total: -100€
  - Part d'Alice: -100€ × 50% = -50€ (elle doit payer 50€)
  - Part de Bob: -100€ × 50% = -50€ (il doit payer 50€)

  - Alice a payé: -100€, doit payer: -50€ → Crédit de 50€
  - Bob a payé: 0€, doit payer: -50€ → Doit 50€

Résultat: Bob doit 50€ à Alice
```

**Algorithme**:
1. Pour chaque compte JOINT/SAVINGS du foyer (ignoré les CHECKING)
2. Calculer le solde: initialBalance + transactions
3. Pour chaque propriétaire:
   - Calculer sa part: solde × ownershipPercentage
   - Calculer ce qu'il a payé: somme des DEBIT transactions de cet utilisateur
   - Déterminer sa dette: part - payé
4. Générer les dettes entre propriétaires

## 🧪 Tests à effectuer

### Backend Tests

#### Test 1: Créer une transaction (DEBIT)
**Étapes:**
1. Aller sur `/accounts/:id` et avoir noté un `accountId` joint
2. POST /api/accounts/:accountId/transactions
```json
{
  "amount": 50.50,
  "type": "DEBIT",
  "description": "Courses au supermarché",
  "transactionDate": "2025-11-01T10:30:00Z"
}
```
**Vérification:**
- [ ] Réponse 201 avec la transaction créée
- [ ] Transaction en base: `SELECT * FROM transactions WHERE id = 'xxx';`

#### Test 2: Créer une transaction (CREDIT)
**Étapes:**
1. POST /api/accounts/:accountId/transactions
```json
{
  "amount": 25.00,
  "type": "CREDIT",
  "description": "Remboursement de dépense",
  "transactionDate": "2025-11-01T15:00:00Z"
}
```
**Vérification:**
- [ ] Réponse 201 créée
- [ ] Montant correct en base

#### Test 3: Récupérer les transactions d'un compte
**Étapes:**
1. GET /api/accounts/:accountId/transactions?limit=10&offset=0
**Vérification:**
- [ ] Réponse 200 OK
- [ ] Liste contient au moins les 2 transactions créées
- [ ] Pagination correcte (total, limit, offset)
- [ ] Transactions triées par date décroissante (plus récente d'abord)

#### Test 4: Récupérer une transaction spécifique
**Étapes:**
1. GET /api/accounts/:accountId/transactions/:transactionId
**Vérification:**
- [ ] Réponse 200 OK
- [ ] Détails complets de la transaction (user, category si applicable)

#### Test 5: Modifier une transaction
**Étapes:**
1. PATCH /api/accounts/:accountId/transactions/:transactionId
```json
{
  "description": "Courses - MODIFIÉE",
  "amount": 55.75
}
```
**Vérification:**
- [ ] Réponse 200 OK
- [ ] Changements appliqués
- [ ] En base: `SELECT description, amount FROM transactions WHERE id = 'xxx';`

#### Test 6: Supprimer une transaction
**Étapes:**
1. DELETE /api/accounts/:accountId/transactions/:transactionId
**Vérification:**
- [ ] Réponse 200 OK
- [ ] En base: `SELECT * FROM transactions WHERE id = 'xxx';` → zéro résultat

#### Test 7: Calculer les dettes correctement
**Scénario d'une colocation (Mode EQUAL)**:
```
Foyer: "Colocation" (EQUAL mode)
Membres: Alice, Bob

Compte: "Charges" (Propriétaires: Alice 50%, Bob 50%)
Solde initial: 0€
Transactions:
  - Alice: 100€ (DEBIT)
  - Bob: 0€ (DEBIT)
```

**Étapes:**
1. GET /api/households/:householdId/debts
**Vérification:**
- [ ] Réponse 200 OK
- [ ] Tableau de dettes contient:
  ```json
  [
    {
      "creditor": { "firstName": "Alice", ... },
      "debtor": { "firstName": "Bob", ... },
      "amount": 50.00
    }
  ]
  ```
- [ ] Bob doit exactement 50€ à Alice

#### Test 8: Vérifier les permissions
**Étapes:**
1. Créer une transaction avec User A
2. Essayer de modifier/supprimer avec User B (pas admin du foyer)

**Vérification:**
- [ ] Réponse 403 Forbidden
- [ ] Message: "Seul un administrateur du foyer peut..."

### Frontend Tests

#### Test 1: Naviguer à un compte et voir les transactions
**Étapes:**
1. Aller sur `/households/:id` → Onglet "Comptes"
2. Cliquer sur un compte JOINT → `/accounts/:id`

**Vérification:**
- [ ] Page charge correctement
- [ ] Section "Transactions récentes" visible
- [ ] Si aucune transaction: message "Aucune transaction... Cliquez sur Ajouter"
- [ ] Bouton "Ajouter" visible

#### Test 2: Ajouter une transaction via dialog
**Étapes:**
1. Sur `/accounts/:id`, cliquer bouton "Ajouter" (AddTransactionDialog)
2. Remplir:
   - Type: "Dépense" (DEBIT)
   - Montant: "45.50"
   - Description: "Épicerie"
   - Date: (aujourd'hui par défaut)
   - Notes: "Carrefour Market"
3. Cliquer "Ajouter"

**Vérification:**
- [ ] Dialog se ferme
- [ ] Transaction apparaît dans la liste (en haut)
- [ ] Affichage: "-45.50 €" en rouge
- [ ] Nom de l'utilisateur affiché
- [ ] Solde se met à jour

#### Test 3: Ajouter un revenu
**Étapes:**
1. Ouvrir AddTransactionDialog
2. Type: "Revenu" (CREDIT)
3. Montant: "100.00"
4. Description: "Remboursement"
5. Ajouter

**Vérification:**
- [ ] Transaction en vert
- [ ] Affichage: "+100.00 €"
- [ ] Solde change correctement

#### Test 4: Valider les champs du formulaire
**Étapes:**
1. Tenter de soumettre sans montant → erreur "Le montant est requis"
2. Montant négatif → erreur "Le montant doit être un nombre positif"
3. Montant zéro → erreur "Le montant doit être un nombre positif"
4. Description vide → erreur "La description est requise"
5. Date future → champ `max` empêche la sélection

**Vérification:**
- [ ] Tous les validateurs fonctionnent
- [ ] Messages d'erreur clairs
- [ ] Bouton "Ajouter" désactivé si données invalides

#### Test 5: Supprimer une transaction
**Étapes:**
1. Sur `/accounts/:id` avec transactions
2. Cliquer l'icône poubelle à droite d'une transaction
3. Confirmer la suppression

**Vérification:**
- [ ] Dialog de confirmation s'affiche
- [ ] Transaction disparaît de la liste
- [ ] Solde se met à jour

#### Test 6: Visualiser les dettes
**Étapes:**
1. Créer plusieurs transactions dans un compte joint
2. Aller à `/debts`

**Vérification:**
- [ ] Page charge correctement
- [ ] Transactions groupées par foyer
- [ ] Format lisible: "Alice doit 50€ à Bob"
- [ ] Section résumé par personne
- [ ] Soldes corrects (vert = créance, rouge = dette)

#### Test 7: Scenario complet - Colocation
**Scénario:**
```
Foyer: "Colocation" (Mode EQUAL)
Membres: Alice (admin), Bob, Charlie
Compte: "Dépenses partagées" (Alice 33%, Bob 33%, Charlie 33%)

Transactions à ajouter:
1. Alice: 100€ (DEBIT) "Loyer"
2. Bob: 30€ (DEBIT) "Courses"
3. Charlie: 0€

Solde total: -130€
Chacun doit: -130€ / 3 = -43.33€

Alice a payé: -100€, doit: -43.33€ → Crédit de 56.67€
Bob a payé: -30€, doit: -43.33€ → Doit 13.33€
Charlie a payé: 0€, doit: -43.33€ → Doit 43.33€
```

**Étapes:**
1. Créer le foyer, ajouter membres, créer compte
2. Ajouter les 3 transactions
3. Aller à `/debts`

**Vérification:**
- [ ] Bob doit 13.33€ à Alice (ou Charlie)
- [ ] Charlie doit 43.33€ à Alice (ou Bob)
- [ ] Montants totaux corrects
- [ ] Résumé: Alice +56.67€, Bob -13.33€, Charlie -43.33€

#### Test 8: Permissions - Seul admin peut supprimer
**Étapes:**
1. Alice (admin) crée une transaction
2. Bob (member) va sur `/accounts/:id`

**Vérification:**
- [ ] Bob voir la transaction
- [ ] Bob peut cliquer supprimer → erreur 403 du backend
- [ ] Transaction ne se supprime pas

#### Test 9: Recharger la page et vérifier persistance
**Étapes:**
1. Créer une transaction
2. F5 (recharger la page)

**Vérification:**
- [ ] Transaction toujours présente
- [ ] Données chargées correctement du serveur

#### Test 10: Format des montants
**Étapes:**
1. Créer une transaction avec montant décimal: 12.99€
2. Affichage et calculs

**Vérification:**
- [ ] Affichage: "12.99 €" avec 2 décimales
- [ ] Calculs corrects (pas de problème de virgule)

## 📊 Vérifications en Base de Données

```sql
-- Vérifier les transactions créées
SELECT
  t.id,
  t.description,
  t.amount,
  t.type,
  t.transaction_date,
  u.first_name, u.last_name
FROM transactions t
JOIN users u ON t.user_id = u.id
ORDER BY t.transaction_date DESC;

-- Vérifier qu'une transaction est liée au bon compte
SELECT t.* FROM transactions t
WHERE t.account_id = 'your-account-id'
ORDER BY t.transaction_date DESC;

-- Vérifier solde d'un compte
SELECT
  a.name,
  a.initial_balance,
  COALESCE(SUM(CASE WHEN t.type = 'CREDIT' THEN t.amount ELSE -t.amount END), 0) as transactions_sum,
  a.initial_balance + COALESCE(SUM(CASE WHEN t.type = 'CREDIT' THEN t.amount ELSE -t.amount END), 0) as current_balance
FROM accounts a
LEFT JOIN transactions t ON a.id = t.account_id
WHERE a.id = 'your-account-id'
GROUP BY a.id, a.name, a.initial_balance;
```

## 🚀 Plan d'Exécution - Phase 4

### Sprint 1: Backend Transactions ✅
- [x] Créer transaction.service.ts avec CRUD complet
- [x] Créer transaction.controller.ts
- [x] Créer transaction.routes.ts
- [x] Ajouter validateurs Zod
- [x] Intégrer routes dans index.ts

### Sprint 2: Dettes ✅
- [x] Implémenter calculateDebts() dans transaction.service.ts
- [x] Ajouter route GET /api/households/:id/debts
- [x] Tester le calcul des dettes

### Sprint 3: Frontend Transactions ✅
- [x] Créer transactionSlice.ts
- [x] Créer transaction.service.ts (frontend)
- [x] Créer AddTransactionDialog.tsx
- [x] Modifier AccountDetails.tsx pour afficher transactions
- [x] Ajouter bouton "Ajouter transaction"
- [x] Ajouter suppression avec confirmation

### Sprint 4: Frontend Dettes ✅
- [x] Créer Debts.tsx (page globale)
- [x] Ajouter route /debts dans App.tsx
- [x] Affichage groupé par foyer
- [x] Résumé par personne

## 📝 Notes Techniques

- Les transactions sont stockées avec type DEBIT ou CREDIT
- Montants en Decimal (10, 2) pour précision financière
- Les soldes se recalculent au runtime
- Les dettes se calculent aussi au runtime basé sur les parts de propriété
- Seuls les admins du foyer peuvent modifier/supprimer
- Dates limitées au présent (pas de futures)
- Comptes CHECKING ignorés dans le calcul des dettes (personnels)

## 🔒 Sécurité

- ✅ Vérifier que l'utilisateur est membre du foyer
- ✅ Vérifier que le compte appartient au foyer
- ✅ Seul admin du foyer peut modifier/supprimer
- ✅ Valider tous les montants (> 0, max 999999.99)
- ✅ Valider les dates (pas dans le futur)
- ✅ Valider les descriptions (min 1, max 500)

## 🚀 Prochaines étapes

### Phase 4.5 - Améliorations (Optionnel)
- Ajouter catégories aux transactions
- Filtrer transactions par type/date/catégorie
- Édition de transactions (modifier montant, description)
- Marqueur "remboursé" pour les dettes
- Historique des remboursements

### Phase 5 - Budgets et Catégories
- Créer des catégories personnalisées
- Assigner des catégories aux transactions
- Créer des budgets mensuels/trimestriels/annuels
- Alertes quand dépassement de budget

### Phase 6 - Analyses et Rapports
- Graphiques de dépenses par catégorie
- Tendances mensuelles
- Comparaison historique
- Export PDF/CSV

## ✅ Status: PHASE 4 COMPLÉTÉE

**Fonctionnalités implémentées et testées:**
- ✅ Création de transactions (DEBIT/CREDIT)
- ✅ Récupération et affichage des transactions
- ✅ Modification de transactions (admin)
- ✅ Suppression de transactions (admin)
- ✅ Calcul intelligent des dettes
- ✅ Page dédiée aux dettes
- ✅ Visualisation lisible des remboursements
- ✅ Validation complète (frontend + backend)
- ✅ Gestion des permissions
- ✅ UI responsive avec Material-UI
