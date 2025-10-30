# Structure du Projet - Finances Familiales

## Vue d'ensemble

```
finances/
├── backend/                          # API Backend (Node.js + Express + Prisma)
├── frontend/                         # Application React
├── CLAUDE.md                         # Cahier des charges complet
├── README.md                         # Documentation principale
├── INSTALLATION.md                   # Guide d'installation
├── STRUCTURE.md                      # Ce fichier
└── .gitignore                        # Fichiers à ignorer par Git
```

## Backend (API)

```
backend/
├── src/
│   ├── config/                       # Configuration de l'application
│   │   ├── database.ts               # Configuration Prisma + connexion DB
│   │   ├── auth.ts                   # Configuration JWT et authentification
│   │   └── server.ts                 # Configuration du serveur Express
│   │
│   ├── controllers/                  # Contrôleurs API (logique des routes)
│   │   ├── auth.controller.ts        # Authentification (login, register, logout)
│   │   ├── user.controller.ts        # Gestion des utilisateurs
│   │   ├── household.controller.ts   # Gestion des foyers
│   │   ├── account.controller.ts     # Gestion des comptes bancaires
│   │   ├── transaction.controller.ts # Gestion des transactions
│   │   ├── category.controller.ts    # Gestion des catégories
│   │   ├── budget.controller.ts      # Gestion des budgets
│   │   ├── recurring.controller.ts   # Gestion des dépenses récurrentes
│   │   └── analytics.controller.ts   # Statistiques et analyses
│   │
│   ├── models/                       # Modèles de données (types TypeScript)
│   │   ├── User.ts                   # Type User
│   │   ├── Household.ts              # Type Household
│   │   ├── Account.ts                # Type Account
│   │   ├── Transaction.ts            # Type Transaction
│   │   ├── Category.ts               # Type Category
│   │   ├── Budget.ts                 # Type Budget
│   │   └── RecurringPattern.ts       # Type RecurringPattern
│   │
│   ├── routes/                       # Définition des routes API
│   │   ├── auth.routes.ts            # Routes /api/auth/*
│   │   ├── user.routes.ts            # Routes /api/users/*
│   │   ├── household.routes.ts       # Routes /api/households/*
│   │   ├── account.routes.ts         # Routes /api/accounts/*
│   │   ├── transaction.routes.ts     # Routes /api/transactions/*
│   │   ├── category.routes.ts        # Routes /api/categories/*
│   │   ├── budget.routes.ts          # Routes /api/budgets/*
│   │   ├── recurring.routes.ts       # Routes /api/recurring/*
│   │   └── analytics.routes.ts       # Routes /api/analytics/*
│   │
│   ├── middleware/                   # Middlewares Express
│   │   ├── auth.middleware.ts        # Vérification JWT et autorisation
│   │   ├── validation.middleware.ts  # Validation des données (Zod)
│   │   ├── error.middleware.ts       # Gestion globale des erreurs
│   │   ├── notFound.middleware.ts    # Gestion des routes non trouvées
│   │   ├── rateLimit.middleware.ts   # Rate limiting (protection DDOS)
│   │   └── upload.middleware.ts      # Upload de fichiers (Multer)
│   │
│   ├── services/                     # Logique métier complexe
│   │   ├── auth.service.ts           # Logique d'authentification
│   │   ├── transaction.service.ts    # Logique des transactions
│   │   ├── analytics.service.ts      # Calculs statistiques
│   │   ├── budget.service.ts         # Calculs budgétaires
│   │   ├── balancing.service.ts      # Calcul de répartition des charges
│   │   ├── categorization.service.ts # Auto-catégorisation
│   │   ├── recurring.service.ts      # Détection des récurrences
│   │   └── export.service.ts         # Export CSV/PDF
│   │
│   ├── utils/                        # Fonctions utilitaires
│   │   ├── logger.ts                 # Logger (Pino)
│   │   ├── encryption.ts             # Chiffrement (bcrypt)
│   │   ├── validators.ts             # Schémas de validation (Zod)
│   │   ├── formatters.ts             # Formatage de données
│   │   └── constants.ts              # Constantes de l'application
│   │
│   └── index.ts                      # Point d'entrée de l'application
│
├── prisma/
│   ├── schema.prisma                 # Schéma de la base de données
│   ├── migrations/                   # Historique des migrations
│   └── seed.ts                       # Données de test (optionnel)
│
├── tests/                            # Tests unitaires et d'intégration
│   ├── unit/                         # Tests unitaires
│   ├── integration/                  # Tests d'intégration
│   └── setup.ts                      # Configuration des tests
│
├── uploads/                          # Fichiers uploadés (gitignored)
├── package.json                      # Dépendances npm
├── tsconfig.json                     # Configuration TypeScript
├── nodemon.json                      # Configuration Nodemon
├── .eslintrc.json                    # Configuration ESLint
├── .env.example                      # Template des variables d'environnement
├── .env                              # Variables d'environnement (gitignored)
└── .gitignore                        # Fichiers à ignorer
```

## Frontend (React)

```
frontend/
├── src/
│   ├── components/                   # Composants React réutilisables
│   │   │
│   │   ├── common/                   # Composants génériques
│   │   │   ├── Button.tsx            # Bouton personnalisé
│   │   │   ├── Input.tsx             # Champ de saisie
│   │   │   ├── Select.tsx            # Liste déroulante
│   │   │   ├── Modal.tsx             # Fenêtre modale
│   │   │   ├── Card.tsx              # Carte
│   │   │   ├── Table.tsx             # Tableau
│   │   │   ├── Loading.tsx           # Indicateur de chargement
│   │   │   ├── Alert.tsx             # Alertes/notifications
│   │   │   └── ConfirmDialog.tsx     # Dialogue de confirmation
│   │   │
│   │   ├── layout/                   # Composants de mise en page
│   │   │   ├── Header.tsx            # En-tête de l'application
│   │   │   ├── Sidebar.tsx           # Menu latéral
│   │   │   ├── Footer.tsx            # Pied de page
│   │   │   ├── Layout.tsx            # Layout principal
│   │   │   └── Navigation.tsx        # Navigation
│   │   │
│   │   ├── auth/                     # Composants d'authentification
│   │   │   ├── LoginForm.tsx         # Formulaire de connexion
│   │   │   ├── RegisterForm.tsx      # Formulaire d'inscription
│   │   │   ├── PasswordReset.tsx     # Réinitialisation mot de passe
│   │   │   └── ProtectedRoute.tsx    # Route protégée
│   │   │
│   │   ├── dashboard/                # Composants du tableau de bord
│   │   │   ├── DashboardCard.tsx     # Carte de statistique
│   │   │   ├── BalanceChart.tsx      # Graphique du solde
│   │   │   ├── RecentTransactions.tsx# Dernières transactions
│   │   │   ├── BudgetOverview.tsx    # Vue d'ensemble des budgets
│   │   │   └── QuickActions.tsx      # Actions rapides
│   │   │
│   │   ├── transactions/             # Composants des transactions
│   │   │   ├── TransactionList.tsx   # Liste des transactions
│   │   │   ├── TransactionForm.tsx   # Formulaire transaction
│   │   │   ├── TransactionItem.tsx   # Item de transaction
│   │   │   ├── TransactionFilter.tsx # Filtres de recherche
│   │   │   ├── CategorySelect.tsx    # Sélecteur de catégorie
│   │   │   └── ImportCSV.tsx         # Import de fichier CSV
│   │   │
│   │   ├── analytics/                # Composants d'analyse
│   │   │   ├── CategoryChart.tsx     # Graphique par catégorie
│   │   │   ├── TrendChart.tsx        # Graphique de tendance
│   │   │   ├── BudgetProgress.tsx    # Progression du budget
│   │   │   ├── ExpenseBreakdown.tsx  # Répartition des dépenses
│   │   │   └── SavingsGoal.tsx       # Objectifs d'épargne
│   │   │
│   │   └── accounts/                 # Composants des comptes
│   │       ├── AccountList.tsx       # Liste des comptes
│   │       ├── AccountForm.tsx       # Formulaire de compte
│   │       ├── AccountCard.tsx       # Carte de compte
│   │       └── AccountBalance.tsx    # Solde du compte
│   │
│   ├── pages/                        # Pages de l'application
│   │   ├── Login.tsx                 # Page de connexion
│   │   ├── Register.tsx              # Page d'inscription
│   │   ├── Dashboard.tsx             # Tableau de bord principal
│   │   ├── Transactions.tsx          # Page des transactions
│   │   ├── Analytics.tsx             # Page d'analyses
│   │   ├── Budgets.tsx               # Page des budgets
│   │   ├── Accounts.tsx              # Page des comptes
│   │   ├── Categories.tsx            # Page des catégories
│   │   ├── Recurring.tsx             # Page des dépenses récurrentes
│   │   ├── Settings.tsx              # Page de paramètres
│   │   └── NotFound.tsx              # Page 404
│   │
│   ├── services/                     # Services API
│   │   ├── api.ts                    # Client Axios configuré
│   │   ├── auth.service.ts           # Service d'authentification
│   │   ├── user.service.ts           # Service utilisateurs
│   │   ├── account.service.ts        # Service comptes
│   │   ├── transaction.service.ts    # Service transactions
│   │   ├── category.service.ts       # Service catégories
│   │   ├── budget.service.ts         # Service budgets
│   │   └── analytics.service.ts      # Service analytics
│   │
│   ├── store/                        # State management (Zustand)
│   │   ├── slices/                   # Slices du store
│   │   │   ├── authSlice.ts          # État d'authentification
│   │   │   ├── userSlice.ts          # État utilisateur
│   │   │   ├── accountSlice.ts       # État des comptes
│   │   │   ├── transactionSlice.ts   # État des transactions
│   │   │   ├── categorySlice.ts      # État des catégories
│   │   │   └── budgetSlice.ts        # État des budgets
│   │   └── store.ts                  # Configuration du store
│   │
│   ├── hooks/                        # Custom hooks React
│   │   ├── useAuth.ts                # Hook d'authentification
│   │   ├── useTransactions.ts        # Hook transactions
│   │   ├── useAccounts.ts            # Hook comptes
│   │   ├── useAnalytics.ts           # Hook analytics
│   │   ├── useBudgets.ts             # Hook budgets
│   │   └── useDebounce.ts            # Hook debounce
│   │
│   ├── utils/                        # Fonctions utilitaires
│   │   ├── formatters.ts             # Formatage (dates, montants)
│   │   ├── validators.ts             # Validation de formulaires
│   │   ├── constants.ts              # Constantes
│   │   ├── theme.ts                  # Thème Material-UI
│   │   └── helpers.ts                # Fonctions d'aide
│   │
│   ├── types/                        # Types TypeScript
│   │   ├── index.ts                  # Types principaux
│   │   ├── api.types.ts              # Types API
│   │   └── form.types.ts             # Types de formulaires
│   │
│   ├── App.tsx                       # Composant racine
│   ├── main.tsx                      # Point d'entrée React
│   └── vite-env.d.ts                 # Types Vite
│
├── public/                           # Fichiers statiques
│   ├── favicon.ico                   # Icône du site
│   └── robots.txt                    # Fichier robots
│
├── index.html                        # HTML racine
├── package.json                      # Dépendances npm
├── tsconfig.json                     # Configuration TypeScript
├── tsconfig.node.json                # Config TypeScript pour Vite
├── vite.config.ts                    # Configuration Vite
├── .eslintrc.cjs                     # Configuration ESLint
├── .env.example                      # Template variables d'environnement
├── .env                              # Variables d'environnement (gitignored)
└── .gitignore                        # Fichiers à ignorer
```

## Base de données (PostgreSQL)

### Tables principales

1. **users** - Utilisateurs de l'application
2. **households** - Foyers (groupes d'utilisateurs)
3. **user_households** - Liaison utilisateurs-foyers
4. **accounts** - Comptes bancaires
5. **account_owners** - Propriétaires des comptes
6. **categories** - Catégories de dépenses
7. **transactions** - Transactions financières
8. **recurring_patterns** - Modèles de dépenses récurrentes
9. **budgets** - Budgets par catégorie
10. **categorization_rules** - Règles d'auto-catégorisation
11. **balancing_records** - Historique de répartition des charges

### Relations

- Un utilisateur peut appartenir à plusieurs foyers
- Un foyer peut avoir plusieurs comptes
- Un compte peut avoir plusieurs propriétaires
- Une transaction appartient à un compte et un utilisateur
- Une transaction a une catégorie
- Un budget est lié à un foyer et une catégorie

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Utilisateurs
- `GET /api/users/me` - Profil actuel
- `PUT /api/users/me` - Modifier le profil
- `GET /api/users/:id` - Obtenir un utilisateur

### Foyers
- `GET /api/households` - Liste des foyers
- `POST /api/households` - Créer un foyer
- `PUT /api/households/:id` - Modifier un foyer
- `DELETE /api/households/:id` - Supprimer un foyer

### Comptes
- `GET /api/accounts` - Liste des comptes
- `POST /api/accounts` - Créer un compte
- `PUT /api/accounts/:id` - Modifier un compte
- `DELETE /api/accounts/:id` - Supprimer un compte

### Transactions
- `GET /api/transactions` - Liste des transactions
- `POST /api/transactions` - Créer une transaction
- `PUT /api/transactions/:id` - Modifier une transaction
- `DELETE /api/transactions/:id` - Supprimer une transaction
- `POST /api/transactions/import` - Importer un CSV

### Catégories
- `GET /api/categories` - Liste des catégories
- `POST /api/categories` - Créer une catégorie
- `PUT /api/categories/:id` - Modifier une catégorie
- `DELETE /api/categories/:id` - Supprimer une catégorie

### Budgets
- `GET /api/budgets` - Liste des budgets
- `POST /api/budgets` - Créer un budget
- `PUT /api/budgets/:id` - Modifier un budget
- `DELETE /api/budgets/:id` - Supprimer un budget

### Analytics
- `GET /api/analytics/dashboard` - Statistiques du dashboard
- `GET /api/analytics/trends` - Tendances temporelles
- `GET /api/analytics/categories` - Répartition par catégorie
- `GET /api/analytics/balance` - Calcul de répartition

## Flux de données

```
User Action (Frontend)
    ↓
React Component
    ↓
Service API (Axios)
    ↓
Express Route (Backend)
    ↓
Controller
    ↓
Service (Logique métier)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
Response ← ← ← ← ← ← ← ← ←
```

## Technologies par couche

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Logger**: Pino
- **Upload**: Multer
- **Security**: Helmet, CORS, bcrypt

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Routing**: React Router
- **Forms**: React Hook Form (à ajouter)
- **Date**: date-fns

### Infrastructure
- **Server**: Node.js
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt
- **Hosting**: Raspberry Pi 4

## Prochaines étapes de développement

Consultez le fichier [CLAUDE.md](CLAUDE.md) section "6. PLAN DE DÉVELOPPEMENT" pour le plan détaillé des phases de développement.

### Phase actuelle : Phase 1 (Configuration)
✅ Structure du projet créée
✅ Configuration des fichiers
✅ Schéma de base de données défini

### Phase suivante : Phase 2 (Authentification)
- Implémenter les routes d'authentification
- Créer les contrôleurs et services
- Créer les formulaires frontend
- Tests de bout en bout
