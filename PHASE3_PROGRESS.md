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

## 📋 À Faire - Frontend UI

### Pages à créer

#### 1. Page Households (Liste des foyers)
Fichier: `frontend/src/pages/Households.tsx`

**Fonctionnalités:**
- Liste de tous les foyers de l'utilisateur
- Bouton "Créer un foyer"
- Carte pour chaque foyer affichant:
  - Nom du foyer
  - Mode de partage
  - Nombre de membres
  - Nombre de comptes
  - Badge Admin/Member
- Clic sur un foyer → navigation vers la page de détails

**Composants Material-UI:**
- `Grid`, `Card`, `CardContent`, `Button`, `Chip`, `Typography`
- Dialog pour création de foyer

#### 2. Page HouseholdDetails (Détails d'un foyer)
Fichier: `frontend/src/pages/HouseholdDetails.tsx`

**Fonctionnalités:**
- Informations du foyer (nom, mode de partage)
- Liste des membres avec revenus
- Bouton "Ajouter un membre" (si admin)
- Bouton "Modifier le mode de partage" (si admin)
- Liste des comptes du foyer
- Bouton "Créer un compte"

**Composants Material-UI:**
- `Tabs`, `TabPanel`, `List`, `ListItem`, `Avatar`
- Dialogs pour ajouter membre et créer compte

#### 3. Page Accounts (Vue globale des comptes)
Fichier: `frontend/src/pages/Accounts.tsx`

**Fonctionnalités:**
- Liste de tous les comptes de tous les foyers
- Filtrage par foyer
- Affichage du solde de chaque compte
- Clic sur un compte → navigation vers détails

**Composants Material-UI:**
- `TableContainer`, `Table`, `TableRow`, `Select` (filtre)

#### 4. Page AccountDetails (Détails d'un compte)
Fichier: `frontend/src/pages/AccountDetails.tsx`

**Fonctionnalités:**
- Informations du compte (nom, type, solde)
- Liste des propriétaires avec leurs parts
- Bouton "Modifier le compte"
- Liste des transactions récentes (Phase 4)
- Bouton "Ajouter une transaction" (Phase 4)

**Composants Material-UI:**
- `Card`, `List`, `Divider`, `IconButton`

#### 5. Amélioration du Dashboard
Fichier: `frontend/src/pages/Dashboard.tsx`

**Ajouts:**
- Section "Mes foyers" avec cartes résumées
- Section "Comptes récents" avec soldes
- Statistiques: total des foyers, total des comptes
- Liens rapides vers création foyer/compte

### Composants réutilisables à créer

#### 1. CreateHouseholdDialog
Fichier: `frontend/src/components/CreateHouseholdDialog.tsx`
- Formulaire: nom, mode de partage
- Validation et soumission

#### 2. CreateAccountDialog
Fichier: `frontend/src/components/CreateAccountDialog.tsx`
- Formulaire: nom, type, foyer, solde initial, propriétaires
- Sélection multiple des propriétaires
- Validation et soumission

#### 3. AddMemberDialog
Fichier: `frontend/src/components/AddMemberDialog.tsx`
- Formulaire: email, rôle
- Validation et soumission

#### 4. AccountCard
Fichier: `frontend/src/components/AccountCard.tsx`
- Carte affichant infos compte et solde
- Réutilisable dans plusieurs pages

### Routing à ajouter dans App.tsx

```typescript
<Route path="/households" element={<ProtectedRoute><Households /></ProtectedRoute>} />
<Route path="/households/:id" element={<ProtectedRoute><HouseholdDetails /></ProtectedRoute>} />
<Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
<Route path="/accounts/:id" element={<ProtectedRoute><AccountDetails /></ProtectedRoute>} />
```

## 🧪 Tests à effectuer

### Backend
1. Créer un foyer avec mode EQUAL
2. Ajouter un membre au foyer
3. Créer un compte PERSONAL avec un seul propriétaire
4. Créer un compte JOINT avec deux propriétaires (vérifier les parts calculées)
5. Tester le mode PROPORTIONAL (revenus différents)
6. Modifier le mode de partage et recalculer les parts
7. Supprimer un membre du foyer
8. Supprimer un compte vide

### Frontend (une fois les pages créées)
1. Navigation entre les pages
2. Création de foyer via dialog
3. Ajout de membre via email
4. Création de compte avec sélection des propriétaires
5. Affichage des soldes
6. Filtrage et recherche

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

1. **Créer les composants UI** (Dialogs)
2. **Créer les pages** (Households, HouseholdDetails, Accounts, AccountDetails)
3. **Mettre à jour le Dashboard**
4. **Ajouter les routes dans App.tsx**
5. **Tester le flux complet**
6. **Passer à la Phase 4** (Transactions)

## 💡 Notes techniques

- Les soldes sont calculés dynamiquement (initialBalance + transactions)
- Les parts sont recalculées si le mode de partage change
- Les revenus mensuels influencent le mode PROPORTIONAL
- Prisma gère les foreign keys et cascades
- Frontend utilise Zustand pour state management local
- API utilise JWT pour authentification
