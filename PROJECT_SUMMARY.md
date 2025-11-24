# 📊 Résumé du Projet - Application Finances Familiales

**Version:** v0.7.5d
**Date:** Novembre 2025
**Statut:** ✅ Production Ready

---

## 🎯 Vue d'Ensemble

Application web complète de **gestion budgétaire familiale** permettant aux couples/familles de:
- 📱 Gérer plusieurs comptes bancaires
- 💰 Tracker les dépenses par catégorie
- 👥 Partager les frais proportionnellement aux revenus
- 🔄 Automatiser les transactions récurrentes
- 📊 Analyser les dépenses et générer des rapports
- 💳 Gérer les budgets avec alertes
- 🏠 Support multi-foyer avec multi-administrateurs

---

## ✅ Fonctionnalités Complétées

### Phase 1-4: Fondations (COMPLÈTE)
- ✅ Authentification JWT
- ✅ Gestion des utilisateurs (signup/login)
- ✅ Gestion des foyers (households)
- ✅ Gestion des comptes bancaires
- ✅ Entrée/édition/suppression des transactions
- ✅ Système de catégories hiérarchiques

### Phase 5: Transactions Récurrentes (COMPLÈTE)
- ✅ Création de patterns récurrents
- ✅ 6 fréquences supportées (jour → année)
- ✅ Génération automatique via cron job (quotidienne)
- ✅ Logs de génération avec gestion d'erreurs
- ✅ Widget dashboard des patterns à venir

### Phase 6: Budgets & Analytics (COMPLÈTE)
- ✅ Création de budgets par catégorie
- ✅ Alertes paramétrables (défaut 80%)
- ✅ Trois périodes supportées (mois/trimestre/année)
- ✅ Snapshots analytics mensuels/trimestriels/annuels
- ✅ Graphiques: breakdown, trends, comparaisons
- ✅ Export PDF/CSV/XLSX
- ✅ Dashboard avec widgets de statut

### Phase 7: Multi-Admin & Partage Proportionnel (COMPLÈTE)
- ✅ Multi-administrateurs par foyer
- ✅ Calcul automatique du revenu mensuel
- ✅ Catégorie de salaire configurable
- ✅ Support de PLUSIEURS catégories de salaire
- ✅ Ratios de partage basés sur le revenu
- ✅ Historique des ratios avec audit trail
- ✅ Ajustement automatique mensuel
- ✅ API endpoint pour voir les catégories de salaire

---

## 🏗️ Architecture

### Backend
- **Framework:** Express.js + TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT (jsonwebtoken)
- **Validation:** Zod
- **Logging:** Pino
- **Security:** Helmet, Rate limiting, CORS

**Structurée en 3 couches:**
```
Controllers (routes) → Services (métier) → Data (Prisma)
```

### Frontend
- **Framework:** React 18 + TypeScript
- **UI:** Material-UI (MUI)
- **State:** Zustand (non Redux)
- **Build:** Vite
- **HTTP:** Axios
- **Charts:** Recharts + MUI X-Charts
- **Routing:** React Router v6

### Deployment
- **Server:** Raspberry Pi 4
- **Nginx:** Reverse proxy + SSL
- **PM2:** Process management
- **Cron:** Recurring transaction generation (quotidien)
- **DB:** PostgreSQL avec backups automatiques

---

## 📁 Structure du Projet

```
finances/
├── backend/                    # API Node.js/Express
│   ├── src/
│   │   ├── config/             # Config Prisma
│   │   ├── controllers/        # Route handlers (8 fichiers)
│   │   ├── services/           # Business logic (11 fichiers)
│   │   ├── routes/             # API routes (8 fichiers)
│   │   ├── middleware/         # Auth, validation, errors (5 fichiers)
│   │   ├── jobs/               # Cron jobs (2 fichiers)
│   │   └── utils/              # Utilities (6 fichiers)
│   └── prisma/
│       └── schema.prisma       # Database schema (19 modèles)
│
├── frontend/                   # Application React
│   └── src/
│       ├── pages/              # Pages (11 fichiers)
│       ├── components/         # Composants réutilisables (34 fichiers)
│       ├── services/           # API calls (8 fichiers)
│       ├── store/              # State management Zustand (7 slices)
│       ├── hooks/              # Custom hooks (2 fichiers)
│       └── utils/              # Utilities (3 fichiers)
│
└── docs/                       # Documentation
    └── phases/
        └── phase4-6/           # Archive phases complétées
```

---

## 🔄 Flux Principal

### 1. Authentification
```
User Registration → Email/Password → JWT Token → Authenticated Session
```

### 2. Gestion des Foyers
```
Create Household → Add Members → Set Sharing Mode → Manage Accounts
```

### 3. Transactions
```
Add Transaction → Choose Account/Category → Amount/Date → Dashboard Updated
```

### 4. Partage Proportionnel
```
Salary Transaction → Income Calculation → Monthly Adjustment →
Sharing Ratios Updated → Expense Allocation Changed
```

### 5. Automatisation
```
Recurring Pattern Defined → Daily Cron Job → Generate Transactions →
Logs Updated → Dashboard Reflects New Transactions
```

---

## 📊 Modèles de Données Clés

### Household (Foyer)
- `id, name, sharing_mode (EQUAL/PROPORTIONAL/CUSTOM), created_at`
- Relations: members, accounts, categories, budgets, patterns

### User
- `id, email, passwordHash, firstName, lastName, monthlyIncome`
- Relations: households via UserHousehold

### Account (Compte Bancaire)
- `id, householdId, name, type, balance, currency`
- Ownership: Multiple users with percentages

### Category
- `id, householdId, name, color, icon, isSalaryCategory` ← NEW
- Support parent/sub-categories
- System categories (protected)

### Transaction
- `id, accountId, categoryId, userId, amount, type (DEBIT/CREDIT), date`
- Optional recurring pattern link

### RecurringPattern
- `id, householdId, accountId, categoryId, frequency, scheduling`
- Generation tracking with logs
- Status management

### Budget
- `id, householdId, categoryId, amount, period (MONTH/QUARTER/YEAR)`
- Alert threshold and tracking

### HouseholdConfiguration
- `householdId, salaryCategoryId, autoAdjustEnabled, adjustDay`
- Proportional sharing configuration

### SharingRatioHistory
- Monthly audit trail of who earns what and what percentage they're responsible for

---

## 🚀 Fonctionnalités Récemment Ajoutées

### Support de Multiples Catégories de Salaire
- ✅ Checkbox "Marquer comme catégorie de salaire" persistant
- ✅ Toutes les catégories marquées sont comptabilisées dans le revenu
- ✅ Endpoint API pour récupérer les catégories de salaire
- ✅ Les transactions sans catégorie ne sont plus comptabilisées

### Correctifs Phase 7
- ✅ `isSalaryCategory` flag persistant dans la base de données
- ✅ Support du flag lors de la création et édition des catégories
- ✅ Backend calcule le revenu avec TOUTES les catégories marquées
- ✅ Frontend affiche correctement l'état des checkboxes

---

## 📈 Statistiques

- **Total de modèles DB:** 19
- **Endpoints API:** 80+
- **Composants React:** 34+
- **Pages:** 11
- **Services backend:** 11
- **Contrôleurs:** 8
- **Routes:** 8
- **Lignes de code:** ~15,000 (sans node_modules)

---

## 🧹 Nettoyage Récent (Nov 2025)

- ✅ Supprimé 1 fichier temporaire (`t HEAD --count`)
- ✅ Supprimé répertoire vide `backend/src/models/`
- ✅ Archivé 18 fichiers de phases 4-6 → `docs/phases/phase4-6/`
- ✅ Supprimé 5 fichiers de documentation redondante
- ✅ **Avant:** 53 fichiers documentation à la racine
- ✅ **Après:** 23 fichiers documentation à la racine (57% réduction)

---

## 🛠️ Commandes Utiles

### Backend
```bash
# Développement
npm run dev

# Build
npm run build

# Production
npm start

# Tests
npm test

# Migrations DB
npx prisma migrate dev --name description
npx prisma migrate deploy
npx prisma db seed
```

### Frontend
```bash
# Développement
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Tests
npm run test
```

### Déploiement Raspberry Pi
```bash
ssh -i key.pem user@moneypi.local
cd ~/finances
npm run build
pm2 restart all
```

---

## 📞 Points de Contact Importants

### Configuration d'Environnement
- Backend: `backend/.env` (PostgreSQL, JWT, CORS)
- Frontend: `frontend/.env` (API URL, etc.)
- Voir `.env.example` pour les templates

### Logs
- Backend: Pino logs en stdout
- Database: PostgreSQL logs
- Cron: Voir logs Raspberry Pi

### Monitoring
- Accès: http://moneypi.local
- Backend API: http://moneypi.local:3030
- Vérifier PM2: `pm2 status` sur le serveur

---

## 🔮 Next Steps / Phase 8

Possibilités futures:
- 📱 Application mobile (React Native)
- 🌐 Multi-langue (i18n)
- 🔔 Notifications push améliorées
- 📲 SMS notifications
- 🎯 Objectifs d'épargne
- 👨‍👩‍👧 Support famille multi-niveaux
- 🌍 Support multi-devises avancé
- 🤖 Categorization IA
- 📱 API mobile améliorée

---

## 📚 Documentation Disponible

| Document | Contenu |
|----------|---------|
| [README.md](README.md) | Vue d'ensemble du projet |
| [START_HERE.md](START_HERE.md) | Guide de navigation |
| [INSTALLATION.md](INSTALLATION.md) | Instructions d'installation |
| [STRUCTURE.md](STRUCTURE.md) | Structure détaillée du code |
| [CONFIGURATION_RASPBERRY_PI.md](CONFIGURATION_RASPBERRY_PI.md) | Setup serveur |
| [PHASE7_QUICK_START.md](PHASE7_QUICK_START.md) | Guide partage proportionnel |
| [docs/phases/phase4-6/](docs/phases/phase4-6/) | Archive phases antérieures |

---

## 👨‍💻 Développement Actif

**Informations de développement:**
- Branche: `main`
- Dernière version: v0.7.5d (Nov 2025)
- Git history: 40+ commits
- Status: Production stable

**Committer:**
```
git status
git log --oneline -10
```

---

**Généré:** 24 Novembre 2025
**Nettoyage complet:** Fait ✅
**Prêt pour:** Production + Nouvelles Features
