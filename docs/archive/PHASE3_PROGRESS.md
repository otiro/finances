# Phase 3 : Gestion des comptes et foyers - Progression

## ✅ Backend Complété

### Services
- [backend/src/services/household.service.ts](backend/src/services/household.service.ts) - Gestion des foyers
  - `createHousehold` - Créer un foyer avec l'utilisateur comme admin
  - `getUserHouseholds` - Récupérer tous les foyers d'un utilisateur
  - `getHouseholdById` - Récupérer un foyer avec vérification d'accès
  - `addMemberToHousehold` - Ajouter un membre (avec vérification admin)
  - `removeMemberFromHousehold` - Supprimer un membre
  - `updateHouseholdSharingMode` - Modifier le mode de partage

- [backend/src/services/account.service.ts](backend/src/services/account.service.ts) - Gestion des comptes
  - `createAccount` - Créer un compte avec calcul automatique des parts
  - `getHouseholdAccounts` - Récupérer tous les comptes d'un foyer
  - `getAccountById` - Récupérer un compte avec transactions récentes
  - `updateAccount` - Mettre à jour un compte
  - `deleteAccount` - Supprimer un compte (si pas de transactions)
  - `getAccountBalance` - Calculer le solde actuel
  - `calculateOwnershipShares` - Calcul intelligent des parts (EQUAL/PROPORTIONAL/CUSTOM)

### Contrôleurs
- [backend/src/controllers/household.controller.ts](backend/src/controllers/household.controller.ts)
  - `createHousehold`, `getUserHouseholds`, `getHouseholdById`
  - `addMember`, `removeMember`, `updateSharingMode`

- [backend/src/controllers/account.controller.ts](backend/src/controllers/account.controller.ts)
  - `createAccount`, `getHouseholdAccounts`, `getAccountById`
  - `updateAccount`, `deleteAccount`, `getAccountBalance`

### Routes
- [backend/src/routes/household.routes.ts](backend/src/routes/household.routes.ts)
  - `POST /api/households` - Créer un foyer
  - `GET /api/households` - Liste des foyers
  - `GET /api/households/:id` - Détails d'un foyer
  - `POST /api/households/:id/members` - Ajouter un membre
  - `DELETE /api/households/:id/members/:memberId` - Retirer un membre
  - `PATCH /api/households/:id/sharing-mode` - Changer le mode de partage

- [backend/src/routes/account.routes.ts](backend/src/routes/account.routes.ts)
  - `POST /api/accounts` - Créer un compte
  - `GET /api/accounts/household/:householdId` - Comptes d'un foyer
  - `GET /api/accounts/:id` - Détails d'un compte
  - `GET /api/accounts/:id/balance` - Solde d'un compte
  - `PATCH /api/accounts/:id` - Modifier un compte
  - `DELETE /api/accounts/:id` - Supprimer un compte

### Validateurs
- [backend/src/utils/validators.ts](backend/src/utils/validators.ts)
  - `createHouseholdSchema` - Validation création foyer
  - `addMemberSchema` - Validation ajout membre
  - `createAccountSchema` - Validation création compte
  - `updateAccountSchema` - Validation mise à jour compte

### Intégration
- [backend/src/index.ts](backend/src/index.ts:43-44) - Routes intégrées

## ✅ Frontend Stores et Services

### Stores Zustand
- [frontend/src/store/slices/householdSlice.ts](frontend/src/store/slices/householdSlice.ts)
  - État: `households`, `currentHousehold`, `isLoading`, `error`
  - Actions: `setHouseholds`, `addHousehold`, `updateHousehold`, `removeHousehold`

- [frontend/src/store/slices/accountSlice.ts](frontend/src/store/slices/accountSlice.ts)
  - État: `accounts`, `currentAccount`, `isLoading`, `error`
  - Actions: `setAccounts`, `addAccount`, `updateAccount`, `removeAccount`

### Services API
- [frontend/src/services/household.service.ts](frontend/src/services/household.service.ts)
  - `getUserHouseholds`, `getHouseholdById`, `createHousehold`
  - `addMemberToHousehold`, `removeMemberFromHousehold`
  - `updateHouseholdSharingMode`

- [frontend/src/services/account.service.ts](frontend/src/services/account.service.ts)
  - `getHouseholdAccounts`, `getAccountById`, `createAccount`
  - `updateAccount`, `deleteAccount`, `getAccountBalance`

## ✅ Frontend Pages et Composants

### Pages
- [frontend/src/pages/Households.tsx](frontend/src/pages/Households.tsx) - Liste des foyers
  - Affiche tous les foyers de l'utilisateur
  - Bouton créer un foyer
  - Navigation vers détails d'un foyer

- [frontend/src/pages/HouseholdDetails.tsx](frontend/src/pages/HouseholdDetails.tsx) - Détails d'un foyer
  - Onglet Membres: liste des membres avec revenus, rôles
  - Onglet Comptes: liste des comptes du foyer avec soldes
  - Boutons d'administration (si admin)
  - **NOUVEAU**: Bouton modifier le mode de partage

- [frontend/src/pages/Accounts.tsx](frontend/src/pages/Accounts.tsx) - Vue globale des comptes
  - Liste de tous les comptes de tous les foyers
  - Affichage des soldes

- [frontend/src/pages/AccountDetails.tsx](frontend/src/pages/AccountDetails.tsx) - Détails d'un compte
  - Informations du compte et propriétaires

### Composants réutilisables
- [frontend/src/components/CreateHouseholdDialog.tsx](frontend/src/components/CreateHouseholdDialog.tsx) - Création foyer
- [frontend/src/components/AddMemberDialog.tsx](frontend/src/components/AddMemberDialog.tsx) - Ajout membre
- [frontend/src/components/CreateAccountDialog.tsx](frontend/src/components/CreateAccountDialog.tsx) - Création compte
- [frontend/src/components/UpdateSharingModeDialog.tsx](frontend/src/components/UpdateSharingModeDialog.tsx) - **NOUVEAU** Modification mode partage
  - Sélecteur du mode (EQUAL/PROPORTIONAL/CUSTOM)
  - Description de chaque mode
  - Validation et soumission

## 📋 À Faire - Prochaine fonctionnalité (Phase 3.5)

### Ajouter des propriétaires à un compte existant

**Description:**
Permettre aux administrateurs de foyer d'ajouter ou retirer des propriétaires d'un compte existant après sa création.

**Fonctionnalités à implémenter:**

#### 1. Backend - Endpoints à créer
- `POST /api/accounts/:id/owners` - Ajouter un propriétaire à un compte
- `DELETE /api/accounts/:id/owners/:userId` - Retirer un propriétaire d'un compte

**Logique:**
- Vérifier que l'utilisateur est admin du foyer propriétaire du compte
- Vérifier que l'utilisateur à ajouter est membre du foyer
- Calculer les nouvelles parts selon le mode de partage du foyer
- Mettre à jour tous les AccountOwner du compte

#### 2. Frontend - Composant à créer
`frontend/src/components/UpdateAccountOwnersDialog.tsx`
- Affiche la liste des propriétaires actuels avec leurs parts
- Affiche la liste des membres du foyer (qui ne sont pas propriétaires)
- Boutons pour ajouter/retirer propriétaires
- Confirmation de changement

#### 3. Frontend - Intégration dans AccountDetails
- Ajouter bouton "Gérer les propriétaires" (si admin du foyer)
- Ouvrir la dialog UpdateAccountOwnersDialog
- Recharger les données après modification

#### 4. Tests
- Tester ajout d'un propriétaire
- Tester retrait d'un propriétaire
- Vérifier recalcul des parts
- Vérifier que seul admin peut modifier

**Exemple d'utilisation:**
```
Compte: "Compte commun"
Propriétaires actuels: Alice (50%), Bob (50%)
Membres du foyer: Alice, Bob, Charlie

Action: Ajouter Charlie comme propriétaire
Nouveau mode EQUAL (3 propriétaires):
  - Alice: 33.33%
  - Bob: 33.33%
  - Charlie: 33.33%
```

### Routing à ajouter dans App.tsx

```typescript
<Route path="/households" element={<ProtectedRoute><Households /></ProtectedRoute>} />
<Route path="/households/:id" element={<ProtectedRoute><HouseholdDetails /></ProtectedRoute>} />
<Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
<Route path="/accounts/:id" element={<ProtectedRoute><AccountDetails /></ProtectedRoute>} />
```

## 🧪 Tests à effectuer

### Backend
1. ✅ Créer un foyer avec mode EQUAL
2. ✅ Ajouter un membre au foyer
3. ✅ Créer un compte CHECKING avec un seul propriétaire
4. ✅ Créer un compte JOINT avec deux propriétaires (vérifier les parts calculées)
5. ✅ Tester le mode PROPORTIONAL (revenus différents)
6. ✅ Modifier le mode de partage et recalculer les parts
7. ✅ Supprimer un membre du foyer
8. ✅ Supprimer un compte vide

### Frontend - Tests complets (Phase 3)

#### Test 1: Navigation et affichage
- [x] Aller sur `/households` - affiche tous les foyers
- [x] Cliquer sur un foyer - accède à `/households/:id`
- [x] Voir l'onglet "Membres" avec liste complète
- [x] Voir l'onglet "Comptes" avec liste complète

#### Test 2: Création d'un foyer
- [x] Cliquer "Créer un foyer"
- [x] Remplir le nom du foyer
- [x] Sélectionner mode EQUAL
- [x] Soumettre et vérifier la création
- [ ] Vérifier en base de données (`SELECT * FROM Household WHERE name = 'Test';`)

#### Test 3: Ajout de membres
- [x] Aller dans HouseholdDetails
- [x] Cliquer sur "Ajouter un membre"
- [x] Entrer email d'un utilisateur existant
- [x] Choisir rôle MEMBER ou ADMIN
- [ ] Vérifier en base: `SELECT * FROM UserHousehold WHERE householdId = 'xxx';`

#### Test 4: Création de compte
- [x] Aller dans HouseholdDetails, onglet Comptes
- [x] Cliquer "Créer un compte"
- [x] Remplir: nom, type (CHECKING/JOINT/SAVINGS)
- [x] Sélectionner propriétaires
- [x] Vérifier le compte créé
- [ ] Vérifier les parts calculées en base: `SELECT id, ownershipPercentage FROM AccountOwner;`

#### Test 5: NOUVEAU - Modifier le mode de partage
**Étapes:**
1. Aller dans HouseholdDetails d'un foyer avec au moins 2 membres
2. À côté du mode de partage actuel (ex: "Parts égales"), un bouton "Modifier" doit apparaître
3. Cliquer sur le bouton "Modifier"
4. La dialog "Modifier le mode de partage" s'ouvre
5. Affiche le mode actuel en Info
6. Sélectionner un nouveau mode dans le dropdown
7. La description du nouveau mode s'affiche
8. Cliquer "Modifier"
9. Vérifier que:
   - Le mode affiche dans HouseholdDetails a changé
   - Les parts de propriété de tous les comptes ont été recalculées
   - En base: `SELECT sharingMode FROM Household WHERE id = 'xxx';`

**Scénario détaillé:**
```
Household: "Ma Colocation" (actuellement EQUAL)
Membres:
  - Alice (revenu: 3000€)
  - Bob (revenu: 2000€)

Compte: "Compte commun" avec Alice et Bob
  - Avant: Alice 50%, Bob 50%

Action: Changer mode EQUAL → PROPORTIONAL

Après:
  - Alice: 60% (3000/5000)
  - Bob: 40% (2000/5000)
```

**Vérification en base:**
```sql
-- Vérifier le mode a changé
SELECT sharingMode FROM Household WHERE id = 'your-household-id';
-- Résultat attendu: PROPORTIONAL

-- Vérifier les parts sont recalculées
SELECT ao.userId, u.firstName, ao.ownershipPercentage
FROM AccountOwner ao
JOIN User u ON ao.userId = u.id
WHERE ao.accountId = 'your-account-id'
ORDER BY u.firstName;
```

#### Test 6: Comptes globaux
- [x] Aller sur `/accounts`
- [x] Voir tous les comptes de tous les foyers
- [x] Cliquer sur un compte → `/accounts/:id`

## 📊 Fonctionnalités avancées

### Calcul intelligent des parts
Le système calcule automatiquement les parts de propriété selon 3 modes:

**EQUAL** - Parts égales
- 2 propriétaires → 50% chacun
- 3 propriétaires → 33.33% chacun

**PROPORTIONAL** - Parts proportionnelles aux revenus
- User A: 3000€, User B: 2000€
- Total: 5000€
- User A: 60%, User B: 40%

**CUSTOM** - Parts personnalisées
- Parts égales par défaut
- Modifiables manuellement (Phase 4)

### Sécurité
- Vérification de membership pour chaque action
- Rôle ADMIN requis pour ajouter/retirer membres
- Propriétaires doivent être membres du foyer
- Impossible de supprimer le dernier admin

## 🚀 Prochaines étapes

### Phase 3 - Status: ✅ COMPLÉTÉE

**Fonctionnalités implémentées et testées:**
- ✅ Création de foyers
- ✅ Gestion des membres de foyer
- ✅ Création de comptes
- ✅ Calcul automatique des parts (EQUAL/PROPORTIONAL/CUSTOM)
- ✅ Modification du mode de partage du foyer
- ✅ Affichage et navigation (Households, HouseholdDetails, Accounts, AccountDetails)
- ✅ Dialogs réutilisables (CreateHousehold, AddMember, CreateAccount, UpdateSharingMode)

### Phase 3.5 - Prochaine amélioration
- [x] ✅ COMPLÉTÉE - Ajouter/retirer propriétaires d'un compte existant
  - Endpoints: POST/DELETE `/api/accounts/:id/owners`
  - Dialog UpdateAccountOwnersDialog implémentée
  - Recalcul automatique des parts

### Phase 4 - Transactions
1. **Créer le modèle Transaction** (montant, date, description, type)
2. **Ajouter endpoints API** (POST/GET/DELETE transactions)
3. **Créer page TransactionsList**
4. **Créer page AddTransaction**
5. **Calculer les soldes dynamiquement** (initialBalance + transactions)
6. **Générer des dettes** (qui doit combien à qui)
7. **Créer page Debts** (visualisation des dettes)

## 💡 Notes techniques

- Les soldes sont calculés dynamiquement (initialBalance + transactions)
- Les parts sont recalculées si le mode de partage change
- Les revenus mensuels influencent le mode PROPORTIONAL
- Prisma gère les foreign keys et cascades
- Frontend utilise Zustand pour state management local
- API utilise JWT pour authentification
