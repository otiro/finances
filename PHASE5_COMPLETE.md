# Phase 5 - Transactions Récurrentes - DOCUMENTATION COMPLÈTE

## 📌 Vue d'ensemble

Phase 5 implémente un système complet de **transactions récurrentes automatisées** permettant aux utilisateurs de configurer des paiements/revenus réguliers qui se génèrent automatiquement.

**Statut** : ✅ **COMPLÈTE ET TESTÉE**

---

## 🏗️ Architecture

### Backend (Phase 5.1)

#### 📁 Fichiers Principaux
- `backend/prisma/schema.prisma` - Modèle `RecurringPattern` et `RecurringTransactionLog`
- `backend/src/services/recurringTransaction.service.ts` - Logique métier
- `backend/src/controllers/recurringTransaction.controller.ts` - Endpoints HTTP
- `backend/src/routes/recurringTransaction.routes.ts` - Routes API
- `backend/src/jobs/recurringTransactionJob.ts` - Cron job de génération

#### 🔌 Endpoints API
```
POST   /api/households/:householdId/recurring-patterns        - Créer un pattern
GET    /api/households/:householdId/recurring-patterns        - Lister les patterns
GET    /api/households/:householdId/recurring-patterns/:id    - Obtenir un pattern
PATCH  /api/households/:householdId/recurring-patterns/:id    - Éditer un pattern
DELETE /api/households/:householdId/recurring-patterns/:id    - Supprimer un pattern
```

#### 🗄️ Modèle de Données
```prisma
model RecurringPattern {
  id                  String              @id @default(uuid())
  householdId         String              // Lien au foyer
  accountId           String              // Compte source
  categoryId          String?             // Catégorie optionnelle

  name                String              // Ex: "Loyer"
  description         String?
  frequency           RecurringFrequency  // DAILY, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, YEARLY
  type                TransactionType     // DEBIT ou CREDIT
  amount              Decimal             // Montant de la transaction

  startDate           DateTime            // Date de première génération
  endDate             DateTime?           // Date finale optionnelle
  dayOfMonth          Int?                // Pour MONTHLY (1-31)
  dayOfWeek           Int?                // Pour WEEKLY (0-6, 0=dimanche)

  nextGenerationDate  DateTime            // Date prochaine génération
  lastGeneratedDate   DateTime?           // Dernière génération

  isActive            Boolean             // Actif/Inactif
  isPaused            Boolean             // Pausé/Non-pausé
}

model RecurringTransactionLog {
  id                  String
  patternId           String
  householdId         String
  status              RecurringTransactionLogStatus  // SUCCESS, FAILED, SKIPPED
  error               String?
  createdAt           DateTime
}
```

#### ⚙️ Cron Job
- **Mode Production** : Exécution quotidienne à 00:00 UTC
- **Mode Hourly** : Exécution toutes les heures (tests/staging)
- **Mode Development** : Exécution toutes les 5 minutes (développement)

**Fonctionnement** :
1. Récupère tous les patterns dus (`nextGenerationDate <= aujourd'hui`)
2. Calcule la date de prochaine génération
3. Crée une transaction pour chaque pattern
4. Enregistre le résultat dans `RecurringTransactionLog`

#### 🔐 Validation
- Schéma Zod pour validation des données
- Support ISO 8601 pour les dates
- Catégories optionnelles (nullable)
- Validation conditionnelle pour dayOfMonth/dayOfWeek

---

### Frontend (Phase 5.2 + 5.3)

#### 📁 Fichiers Principaux

**Pages** :
- `frontend/src/pages/RecurringTransactions.tsx` - Page de gestion des patterns
- `frontend/src/pages/HouseholdDetails.tsx` - Tab "Aperçu" avec widget

**Composants** :
```
frontend/src/components/RecurringPatterns/
├── RecurringPatternForm.tsx          - Formulaire création/édition
├── RecurringPatternCard.tsx          - Affichage d'un pattern
├── RecurringPatternSelector.tsx      - Sélecteur pour dialogs
├── RecurringPatternsList.tsx         - Liste des patterns
├── RecurringPatternWidget.tsx        - Widget du dashboard
└── FrequencySelector.tsx             - Sélecteur de fréquence

frontend/src/components/Dialogs/
├── AddRecurringPatternDialog.tsx     - Dialog création
├── EditRecurringPatternDialog.tsx    - Dialog édition
└── DeleteRecurringPatternDialog.tsx  - Dialog suppression
```

**State Management** :
- `frontend/src/store/slices/recurringTransactionSlice.ts` - Redux slice
- `frontend/src/store/store.ts` - Configuration Redux
- `frontend/src/store/hooks.ts` - Hooks typés Redux

**Services** :
- `frontend/src/services/recurringTransaction.service.ts` - API client

#### 🎨 Fonctionnalités Frontend

**Page Transactions Récurrentes** :
- ✅ Créer un nouveau pattern
- ✅ Lister tous les patterns du foyer
- ✅ Éditer un pattern
- ✅ Supprimer un pattern
- ✅ Pause/Reprendre un pattern
- ✅ Affichage formaté des montants et dates
- ✅ Navigation retour au foyer
- ✅ Actualisation des données

**Widget Dashboard** :
- ✅ Affichage des statistiques (actifs/pausés/dépenses/revenus)
- ✅ Liste des 5 prochaines transactions
- ✅ Tri par date de génération
- ✅ Format français des dates
- ✅ Icônes et couleurs (rouge=débit, vert=crédit)
- ✅ Gestion d'erreurs
- ✅ Design responsive

**Tab "Aperçu"** :
- ✅ Widget des transactions récurrentes
- ✅ Card informations du foyer (mode partage, stats)
- ✅ Layout 2 colonnes sur desktop
- ✅ Stack vertical sur mobile

#### ✨ Détails d'Implémentation

**Gestion des Dates** :
```typescript
// Conversion datetime-local → ISO 8601
Input: "2025-11-01T14:30"
Output: "2025-11-01T14:30:00Z"

Input: "2025-11-01"
Output: "2025-11-01T00:00:00Z"
```

**Validation Formulaire** :
- Amount: accepte number ou string (conversion auto)
- Dates: accept ISO 8601 valide
- dayOfMonth/dayOfWeek: validation conditionnelle basée sur fréquence
- categoryId: optionnelle

**Formatage Affichage** :
- Dates: Format français court (ex: "sam. 8 nov.")
- Montants: 2 décimales avec signe (ex: "+ 2000.00 €", "- 100.00 €")
- Couleurs: DEBIT=rouge (#d32f2f), CREDIT=vert (#388e3c)

---

## 📊 Flux d'Utilisation

### Scénario 1: Créer une Transaction Récurrente

```
1. Utilisateur accède à /households/:id/recurring-transactions
2. Clique "Ajouter"
3. Remplit le formulaire :
   - Sélectionne un compte
   - Rentre nom (ex: "Loyer")
   - Choisit fréquence MONTHLY
   - Rentre montant 1500€
   - Choisit type DEBIT
   - Rentre startDate aujourd'hui
   - Rentre dayOfMonth=1
4. Clique "Créer"
5. API crée le pattern avec :
   - nextGenerationDate = 1er novembre 2025
   - isActive = true
   - isPaused = false
6. Pattern apparaît dans la liste
7. Widget du dashboard se met à jour
```

### Scénario 2: Génération Automatique

```
1. Cron job s'exécute (minuit UTC)
2. Trouve tous patterns dus (nextGenerationDate <= aujourd'hui)
3. Pour chaque pattern :
   a. Crée une Transaction avec is_recurring=true
   b. Calcule nextGenerationDate suivante
   c. Enregistre le succès dans RecurringTransactionLog
4. Transactions apparaissent dans l'historique
5. Les soldes de compte sont mis à jour
```

### Scénario 3: Consulter le Dashboard

```
1. Utilisateur accède au foyer
2. Clique sur tab "Aperçu"
3. Voit le widget avec :
   - Statistiques (actifs/pausés/montants)
   - 5 prochaines transactions
4. Peut cliquer "Voir tous" pour la page complète
5. Peut cliquer "Créer" pour ajouter un nouveau pattern
```

---

## 🧪 Testing

### Phase 5.1 - Backend
Fichier: `TESTING_PHASE5_1.md`
- ✅ Endpoints API testés
- ✅ Validation de données
- ✅ Gestion d'erreurs
- ✅ Cron job en mode développement

### Phase 5.2 - Frontend
Fichier: `TESTING_PHASE5_2.md`
- ✅ Création de patterns
- ✅ Édition/Suppression
- ✅ Validation formulaire
- ✅ Formatage affichage
- ✅ Navigation

### Phase 5.3 - Widget Dashboard
Fichier: `TESTING_PHASE5_3.md`
- ✅ Affichage du widget
- ✅ Statistiques correctes
- ✅ Liste triée
- ✅ Responsive design
- ✅ Gestion d'erreurs

### Phase 5.4 - Intégration Complète
- ✅ Tests d'intégration end-to-end
- ✅ Cron job génère transactions
- ✅ Coherence des données
- ✅ Performance

**Résultat**: ✅ TOUS LES TESTS PASSENT

---

## 🚀 Déploiement

### Raspberry Pi

1. **Build Frontend** :
   ```bash
   cd frontend
   npm run build
   ```

2. **Build Backend** :
   ```bash
   cd backend
   npm run build
   ```

3. **Déployer Backend** :
   ```bash
   # Arrêter service
   sudo systemctl stop finances-backend

   # Copier fichiers compilés
   cp -r dist/* ~/finances/backend/dist/

   # Redémarrer
   sudo systemctl start finances-backend
   ```

4. **Vérifier Cron Job** :
   ```bash
   # Voir les logs
   tail -f ~/finances/backend/logs/app.log | grep "Cron Job"
   ```

---

## 📈 Performances

### Requêtes Optimisées
- Tri en base de données
- Pagination (si besoin futur)
- Indexes sur householdId, nextGenerationDate

### Cron Job
- Exécution en arrière-plan
- Pas de blocage du serveur
- Logging complet pour debugging

### Frontend
- Redux pour éviter re-renders inutiles
- Lazy loading des composants
- Images optimisées (icons Material-UI)

---

## 🔄 Améliorations Futures

1. **Génération Intelligente**
   - Gérer les mois avec moins de jours
   - Support des jours ouvriers
   - Décalage de génération (ex: générer 2 jours avant)

2. **Notifications**
   - Email avant la génération
   - In-app notifications
   - Rappels manuels

3. **Analytiques**
   - Historique de génération
   - Tableau de bord des récurrences
   - Projections futures

4. **Templates**
   - Modèles de patterns courants
   - Import/Export
   - Duplication facile

---

## 📚 Fichiers de Référence

### Documentation
- `CRON_JOB_VERIFICATION.md` - Guide vérification cron job
- `TESTING_PHASE5_1.md` - Tests backend
- `TESTING_PHASE5_2.md` - Tests frontend
- `TESTING_PHASE5_3.md` - Tests widget

### Code Source Principal
```
Backend:
- backend/src/services/recurringTransaction.service.ts    (250 lignes)
- backend/src/controllers/recurringTransaction.controller.ts (200 lignes)
- backend/src/jobs/recurringTransactionJob.ts (120 lignes)

Frontend:
- frontend/src/pages/RecurringTransactions.tsx (150 lignes)
- frontend/src/components/RecurringPatterns/*.tsx (1400 lignes)
- frontend/src/store/slices/recurringTransactionSlice.ts (300 lignes)
```

---

## ✅ Checklist de Validation

- [x] Modèle Prisma créé et migré
- [x] Endpoints API implémentés
- [x] Validation Zod en place
- [x] Cron job fonctionnel
- [x] Frontend complet (créer/éditer/supprimer)
- [x] Widget dashboard
- [x] Tests unitaires passants
- [x] Tests d'intégration réussis
- [x] Documentation complète
- [x] Déployé sur Raspberry Pi

---

## 🎓 Leçons Apprises

1. **Gestion des Dates** : ISO 8601 strict nécessaire côté backend
2. **Validation Conditionnelle** : Zod refine() pour conditions complexes
3. **State Management** : Redux pour données complexes avec relations
4. **Design Responsive** : Grid MUI très flexible
5. **Cron Jobs** : Besoin de logging robuste pour debugging

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `tail -f ~/finances/backend/logs/app.log`
2. Consulter `CRON_JOB_VERIFICATION.md`
3. Vérifier la base de données : `psql -U postgres -d finances`
4. Relancer le backend

---

**Phase 5 est maintenant complète et prête pour la Phase 6** ✨

