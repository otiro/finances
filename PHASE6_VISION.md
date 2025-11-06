# Phase 6 - Vision & Planning

## 🎯 Objectif Global de Phase 6

Implémenter un **système de budgétisation intelligente et d'analytiques financières** pour permettre aux utilisateurs de :
- Fixer et gérer des budgets par catégorie
- Suivre les dépenses par rapport aux budgets
- Générer des rapports analytiques
- Visualiser les tendances financières
- Faire des projections futures

---

## 🚀 Trois Options de Phase 6

### Option A : BUDGETS (Recommandée) ⭐
**Complexité** : Moyenne
**Durée estimée** : 2-3 semaines
**Impact utilisateur** : Haut

#### Fonctionnalités
- Créer budgets par catégorie
- Définir période (mensuelle/trimestrielle/annuelle)
- Suivre progression vs budget (graphiques)
- Alertes quand budget atteint X%
- Historique des budgets

#### Exemple Workflow
```
1. Admin crée budget "Alimentation" : 400€/mois
2. Système track les dépenses dans "Alimentation"
3. Affiche progression : 250€ / 400€ (62.5%)
4. Alerte si dépasse 80%
5. Rapport mensuel avec respect des budgets
```

---

### Option B : ANALYTIQUES & RAPPORTS
**Complexité** : Élevée
**Durée estimée** : 3-4 semaines
**Impact utilisateur** : Haut

#### Fonctionnalités
- Dashboard analytique avancé
- Graphiques (pie, bar, line)
- Rapports PDF exportables
- Tendances temporelles
- Comparaisons année/mois

#### Exemple Workflow
```
1. Utilisateur accède /analytics
2. Voit breakdown dépenses par catégorie (pie chart)
3. Voit tendances mensuelles (line chart)
4. Export rapport PDF
5. Comparaison avec mois précédent
```

---

### Option C : NOTIFICATIONS & REMINDERS
**Complexité** : Faible
**Durée estimée** : 1-2 semaines
**Impact utilisateur** : Moyen

#### Fonctionnalités
- Email/SMS notifications
- In-app notifications
- Reminders de transactions dues
- Alertes anomalies (dépense inhabituelle)
- Résumés quotidiens/hebdomadaires

---

## 📊 Comparaison

| Aspect | Budgets | Analytiques | Notifications |
|--------|---------|-------------|---------------|
| Valeur métier | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Complexité | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Temps impl. | 2-3 sem | 3-4 sem | 1-2 sem |
| Dépendances | BD, API | BD, Charts, Export | Email, DB |
| Cas limites | Peu | Plusieurs | Peu |

---

## 🎯 Recommandation : PHASE 6 = BUDGETS + Fondations Analytiques

Combiner les deux pour un impact maximal :

### Phase 6.1 : Backend Budgets
- Modèle Prisma Budget
- CRUD API pour budgets
- Logique de tracking vs budget
- Calculs et alertes

### Phase 6.2 : Frontend Budgets
- Page gestion budgets
- Widget progress bar
- Alertes visuelles
- Dialogue création/édition

### Phase 6.3 : Fondations Analytiques
- Endpoints API pour données analytiques
- Calculs agrégés (total par catégorie, etc.)
- Préparation pour graphiques

### Phase 6.4 : Dashboard Analytique
- Première version dashboards
- Charts simples (pie, bar)
- Filtres par période
- Export basic CSV

---

## 📈 Roadmap Phase 6

```
Semaine 1 : Phase 6.1 Backend Budgets
  - Prisma migrations
  - Services + Controllers
  - API endpoints
  - Validation

Semaine 2 : Phase 6.2 Frontend Budgets
  - Page gestion budgets
  - Formulaires création/édition
  - Liste avec progress
  - Redux state

Semaine 3 : Phase 6.3 Analytiques Backend
  - Endpoints analytiques
  - Agrégations en DB
  - Caching si nécessaire

Semaine 4 : Phase 6.4 Dashboard Analytique
  - Charts (Chart.js ou Recharts)
  - Dashboard principal
  - Exports PDF/CSV
  - Tests complets
```

---

## 🏗️ Architecture Proposée

### Backend
```
Phase 6.1:
  - models: Budget (avec tracking)
  - services/budgetService.ts
  - controllers/budgetController.ts
  - routes/budgetRoutes.ts

Phase 6.3:
  - services/analyticsService.ts (readonly, agrégations)
  - controllers/analyticsController.ts
  - routes/analyticsRoutes.ts
```

### Frontend
```
Phase 6.2:
  - pages/Budgets.tsx
  - components/BudgetForm.tsx
  - components/BudgetCard.tsx
  - components/BudgetProgressBar.tsx
  - store/slices/budgetSlice.ts

Phase 6.4:
  - pages/Analytics.tsx
  - components/Charts/
    - CategoryBreakdown.tsx (pie)
    - MonthlySpendings.tsx (line)
    - ComparingCategoryTrends.tsx (bar)
  - services/analyticsService.ts
```

---

## 💾 Données Nécessaires

### Budget Model
```prisma
model Budget {
  id                String   @id @default(uuid())
  householdId       String   // Lien foyer
  categoryId        String   // Catégorie à budgétiser
  period            String   // MONTHLY, QUARTERLY, YEARLY
  amount            Decimal  // Montant max
  startDate         DateTime // Date début
  endDate           DateTime // Date fin

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  household         Household
  category          Category
}

model BudgetTracking {
  id                String   @id @default(uuid())
  budgetId          String
  spent             Decimal  // Montant dépensé
  remaining         Decimal  // Remaining budget
  percentageUsed    Decimal  // Calcul
  month             Int      // Pour suivi mensuel
  year              Int

  updatedAt         DateTime @updatedAt
}
```

---

## 🔄 Intégration Existante

### Données Phase 5 Réutilisées
- Transactions existantes pour calculs
- Catégories pour budgétisation
- RecurringPatterns pour projections
- Household pour autorisation

### Modifications Phase 5
- Aucune (backward compatible)

---

## 📊 Métriques de Succès Phase 6

- [ ] Utilisateurs peuvent créer 10+ budgets
- [ ] Graphiques chargent en < 2 secondes
- [ ] Rapports PDF générés correctement
- [ ] Alertes bugdet envoyées à temps
- [ ] 95%+ tests de couverture
- [ ] Documentation complète

---

## 🎁 Bonus Optionnel

Si temps restant après Phase 6.4 :

1. **Prédictions IA**
   - Suggérer budgets basés sur historique
   - Prévoir dépassements

2. **Règles Automatiques**
   - Alertes personnalisées
   - Actions auto (ex: marquer transaction excessive)

3. **Intégration Bancaire**
   - Import transactions automatique
   - Synchronisation avec comptes

4. **Mobile App**
   - React Native
   - Notifications push

---

## 📋 Checklist Avant de Démarrer Phase 6

- [ ] Phase 5 complètement testée ✅
- [ ] Documentation Phase 5 prête ✅
- [ ] Équipe alignée sur vision Phase 6
- [ ] Environnement de dev à jour
- [ ] Base de données backupée
- [ ] Branches git prêtes (phase-6 branch)

---

## ✅ Décision

**À confirmer par le user** :
- Quelle option ? (Budgets + Analytiques recommandé)
- Timeline acceptable ?
- Priorités spécifiques ?

---

**Prêt à démarrer Phase 6 ? 🚀**

