# Phase 6C - Reminders - Plan Détaillé

## 🎯 Vue d'ensemble

Implémenter un **système de reminders** permettant aux utilisateurs de :
- Créer des rappels pour transactions futures
- Rappels automatiques pour transactions récurrentes
- Interface de gestion des reminders
- Historique des reminders complétés/ignorés

**Note** : Pas de notifications email/SMS/in-app. Les reminders sont consultables via UI uniquement.

**Durée estimée** : 1-2 semaines
**Complexité** : Basse-Moyenne
**Impact utilisateur** : Moyen
**Dépend de** : Phase 5 (patterns récurrents)

---

## 📊 Modèle de Données

### Reminder Models
```prisma
model Reminder {
  id                String    @id @default(uuid())
  householdId       String    @map("household_id")
  userId            String?   @map("user_id")  // Qui l'a créé

  title             String    // "Payer loyer"
  description       String?
  dueDate           DateTime  @map("due_date")

  type              String    // TRANSACTION, RECURRING, CUSTOM
  transactionId     String?   @map("transaction_id")
  recurringPatternId String?  @map("recurring_pattern_id")

  priority          String    @default("NORMAL")  // LOW, NORMAL, HIGH
  status            String    @default("PENDING")  // PENDING, COMPLETED, IGNORED, OVERDUE

  tags              String?   // CSV "payment,important"
  reminderDates     String    // JSON stringified array of dates
                              // Ex: "[2025-11-06T10:00:00Z, 2025-11-07T10:00:00Z]"

  completedAt       DateTime? @map("completed_at")
  completedBy       String?   @map("completed_by")  // Qui l'a complété

  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  // Relations
  household         Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  user              User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  transaction       Transaction? @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  recurringPattern  RecurringPattern? @relation(fields: [recurringPatternId], references: [id], onDelete: Cascade)

  @@map("reminders")
}

model ReminderHistory {
  id                String    @id @default(uuid())
  reminderId        String    @map("reminder_id")

  action            String    // COMPLETED, IGNORED, SNOOZED
  snoozedUntil      DateTime? @map("snoozed_until")  // Si SNOOZED

  notes             String?
  completedAt       DateTime  @default(now()) @map("completed_at")

  // Relations
  reminder          Reminder  @relation(fields: [reminderId], references: [id], onDelete: Cascade)

  @@map("reminder_history")
}

// Relation many-to-many pour Reminders
model Reminder {
  // ... champs existants ...
  history           ReminderHistory[]
}

model Transaction {
  // ... champs existants ...
  reminders         Reminder[]
}

model RecurringPattern {
  // ... champs existants ...
  reminders         Reminder[]
}
```

---

## 🏗️ Architecture Backend

### Services Layer

#### `reminderService.ts` (~350 lignes)
```typescript
// Créer un reminder
async createReminder(householdId, userId, data)
  - Valider dates
  - Créer reminder
  - Générer reminder dates (3 jours avant, 1 jour avant, jour même)
  - Retourner reminder

// Récupérer reminders
async getReminders(householdId, userId, filters?)
  - filters: status (PENDING, COMPLETED, OVERDUE, etc.)
  - Récupérer reminders du household
  - Trier par dueDate ASC
  - Retourner liste

// Mettre à jour reminder
async updateReminder(reminderId, householdId, userId, data)
  - Vérifier accès household
  - Mettre à jour
  - Si dueDate changée, régénérer reminder dates
  - Retourner reminder

// Compléter reminder
async completeReminder(reminderId, householdId, userId)
  - Vérifier accès
  - Marquer COMPLETED
  - Enregistrer completedAt + completedBy
  - Créer ReminderHistory entry
  - Retourner reminder

// Ignorer reminder
async ignoreReminder(reminderId, householdId, userId)
  - Vérifier accès
  - Marquer IGNORED
  - Créer ReminderHistory entry
  - Retourner reminder

// Reporter reminder (snooze)
async snoozeReminder(reminderId, householdId, userId, snoozeMinutes)
  - Vérifier accès
  - Ajouter snoozeMinutes à dueDate
  - Retourner reminder (édité)
  - Créer ReminderHistory entry

// Supprimer reminder
async deleteReminder(reminderId, householdId, userId)
  - Vérifier accès
  - Supprimer (cascade sur history)
  - Retourner confirmation

// Récupérer historique reminder
async getReminderHistory(reminderId, householdId, userId)
  - Vérifier accès
  - Récupérer tous entries history
  - Trier par date DESC
  - Retourner liste

// Générer reminders pour patterns récurrents
async generateRemindersForRecurringPattern(patternId)
  - Récupérer pattern
  - Pour chaque futur exécution (3 mois)
  - Créer reminder si pas déjà présent
  - Retourner count créés

// Générer reminders dus
async generateOverdueReminders()
  - Chercher reminders avec dueDate < maintenant
  - Marquer OVERDUE (pas PENDING)
  - Retourner count

// Obtenir stats
async getReminderStats(householdId, userId)
  - Total reminders
  - Pending count
  - Overdue count
  - Completed cette semaine
  - Retourner stats
```

### Controllers Layer

#### `reminderController.ts` (~450 lignes)
```typescript
// POST /api/households/:householdId/reminders
async createReminder()
  - Valider input Zod
  - Appeler service
  - Retourner 201 + reminder

// GET /api/households/:householdId/reminders
async listReminders()
  - Query params: status, sortBy, limit
  - Appeler service
  - Retourner liste

// GET /api/households/:householdId/reminders/:reminderId
async getReminderDetail()
  - Appeler service
  - Retourner reminder + history

// PATCH /api/households/:householdId/reminders/:reminderId
async updateReminder()
  - Valider input
  - Appeler service
  - Retourner reminder mis à jour

// POST /api/households/:householdId/reminders/:reminderId/complete
async completeReminder()
  - Appeler service
  - Retourner reminder (status COMPLETED)

// POST /api/households/:householdId/reminders/:reminderId/ignore
async ignoreReminder()
  - Appeler service
  - Retourner reminder (status IGNORED)

// POST /api/households/:householdId/reminders/:reminderId/snooze
async snoozeReminder()
  - Body: minutes (30, 60, 1440, etc.)
  - Appeler service
  - Retourner reminder (dueDate updated)

// DELETE /api/households/:householdId/reminders/:reminderId
async deleteReminder()
  - Appeler service
  - Retourner 204

// GET /api/households/:householdId/reminders/:reminderId/history
async getReminderHistory()
  - Appeler service
  - Retourner historique

// GET /api/households/:householdId/reminders/stats
async getReminderStats()
  - Appeler service
  - Retourner stats

// POST /api/households/:householdId/reminders/sync
async syncRemindersWithPatterns()
  - Pour chaque pattern du household
  - Appeler generateRemindersForRecurringPattern
  - Retourner count créés
```

### Routes
```typescript
router.post('/:householdId/reminders', createReminder);
router.get('/:householdId/reminders', listReminders);
router.get('/:householdId/reminders/stats', getReminderStats);
router.get('/:householdId/reminders/:reminderId', getReminderDetail);
router.patch('/:householdId/reminders/:reminderId', updateReminder);
router.post('/:householdId/reminders/:reminderId/complete', completeReminder);
router.post('/:householdId/reminders/:reminderId/ignore', ignoreReminder);
router.post('/:householdId/reminders/:reminderId/snooze', snoozeReminder);
router.delete('/:householdId/reminders/:reminderId', deleteReminder);
router.get('/:householdId/reminders/:reminderId/history', getReminderHistory);
router.post('/:householdId/reminders/sync', syncRemindersWithPatterns);
```

### Validation (Zod)
```typescript
const createReminderSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  dueDate: z.string().refine(val => !isNaN(Date.parse(val))),
  type: z.enum(['TRANSACTION', 'RECURRING', 'CUSTOM']),
  transactionId: z.string().optional(),
  recurringPatternId: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL'),
  tags: z.string().max(200).optional(),
});
```

---

## 🎨 Architecture Frontend

### Pages

#### `Reminders.tsx` (~250 lignes)
```
Layout:
  - Header: "Reminders" + Button "Créer"
  - Tabs: Pending | Completed | Overdue | All
  - List de ReminderCard
  - Stats sidebar

Actions:
  - Créer nouveau
  - Voir détails
  - Compléter
  - Ignorer
  - Snooze
  - Éditer
  - Supprimer
```

### Composants

#### `ReminderForm.tsx` (~200 lignes)
```typescript
// Création/Édition formulaire
- Input titre
- Textarea description
- Date picker dueDate
- Select type (TRANSACTION, RECURRING, CUSTOM)
- Optionnel: link transactionId
- Optionnel: link recurringPatternId
- Select priorité (LOW/NORMAL/HIGH)
- Input tags
- Validation Zod
```

#### `ReminderCard.tsx` (~150 lignes)
```typescript
// Card affichant un reminder
- Titre + icône priorité
- Description courte
- Due date (formatée: "Dans 3 jours", "Overdue")
- Status badge (PENDING/COMPLETED/IGNORED/OVERDUE)
- Priority color (gris/bleu/rouge)
- Actions: Complete, Ignore, Snooze, Edit, Delete
- Tags
```

#### `ReminderDetailDialog.tsx` (~250 lignes)
```
Layout:
  - Header: Titre + Priority
  - Description
  - Due date + Time
  - Type + Link (si transaction/pattern)
  - Tags
  - Status history (timeline)
  - Actions: Complete, Ignore, Snooze, Edit, Delete
```

#### `ReminderList.tsx` (~150 lignes)
```typescript
// Liste reminders
- Tabs pour filtres (Pending, Completed, Overdue, All)
- Tri: Due Date, Priority
- Responsive: List ou Cards selon écran
```

#### `ReminderStatsWidget.tsx` (~100 lignes)
```typescript
// Widget stats
- Pending count
- Overdue count
- Completed this week count
- Urgent count (HIGH priority)
```

#### `SnoozeDialog.tsx` (~100 lignes)
```typescript
// Dialog reporter reminder
- Quick options: 30 min, 1h, 1 day, 1 week
- Custom time picker
- Bouton snooze
```

#### `ReminderTimelineHistory.tsx` (~120 lignes)
```typescript
// Timeline historique actions
- Actions: COMPLETED, IGNORED, SNOOZED
- Dates + times
- Qui a fait l'action
- Notes optionnelles
```

### State Management (Redux)

#### `reminderSlice.ts` (~350 lignes)
```typescript
// State
reminders: Reminder[]
selectedReminder: Reminder | null
remindersHistory: ReminderHistory[]
stats: ReminderStats
loading: boolean
error: string | null

// Async Thunks
fetchReminders(householdId, filter?)
fetchReminderDetail(reminderId, householdId)
createReminder(householdId, data)
updateReminder(reminderId, householdId, data)
completeReminder(reminderId, householdId)
ignoreReminder(reminderId, householdId)
snoozeReminder(reminderId, householdId, minutes)
deleteReminder(reminderId, householdId)
fetchReminderHistory(reminderId, householdId)
fetchReminderStats(householdId)
syncRemindersWithPatterns(householdId)

// Selectors
selectReminders
selectPendingReminders
selectOverdueReminders
selectCompletedReminders
selectReminderById
selectReminderStats
selectUpcomingReminders (7 prochains jours)
```

### Services

#### `reminderService.ts` (~150 lignes)
```typescript
// API client
getReminders(householdId, filter?)
getReminderDetail(reminderId, householdId)
createReminder(householdId, data)
updateReminder(reminderId, householdId, data)
completeReminder(reminderId, householdId)
ignoreReminder(reminderId, householdId)
snoozeReminder(reminderId, householdId, minutes)
deleteReminder(reminderId, householdId)
getReminderHistory(reminderId, householdId)
getReminderStats(householdId)
syncRemindersWithPatterns(householdId)
```

---

## 🎨 UI/UX Design

### Color Coding
- **PENDING** : Bleu (#2196F3)
- **OVERDUE** : Rouge (#f44336)
- **COMPLETED** : Vert (#4caf50)
- **IGNORED** : Gris (#9e9e9e)

### Priority Icons
- **HIGH** : 🔴 (Red circle)
- **NORMAL** : 🟡 (Yellow circle)
- **LOW** : 🟢 (Green circle)

### Responsive
- Desktop (1920px) : Grid 2-3 colonnes
- Tablet (768px) : Grid 1-2 colonnes
- Mobile (375px) : Liste full width

---

## 🔄 Intégration avec Phase 5

### Auto-generation from Patterns
```typescript
// Quand pattern créé, générer reminders pour les 3 mois suivants
- Reminder 1 : 3 jours avant
- Reminder 2 : 1 jour avant
- Reminder 3 : Jour même

// Quand pattern édité
- Régénérer reminders pour dates changedées
```

### Linking
- Reminder → Transaction (optional)
- Reminder → RecurringPattern (optional)
- Clique pour voir détails liés

---

## 🧪 Testing (Phase 6C)

### Backend Tests (~25 cas)
- [x] Créer reminder
- [x] Récupérer reminders
- [x] Éditer reminder
- [x] Compléter reminder
- [x] Ignorer reminder
- [x] Snooze reminder
- [x] Supprimer reminder
- [x] Historique reminder
- [x] Stats correctes
- [x] Auto-generate patterns
- [x] Overdue detection
- [x] Validation dates

### Frontend Tests (~20 cas)
- [x] Affichage liste
- [x] Créer nouveau
- [x] Formulaire validation
- [x] Complete action
- [x] Ignore action
- [x] Snooze action
- [x] Edit reminder
- [x] Delete avec confirmation
- [x] Détails dialog
- [x] Historique timeline
- [x] Stats widget
- [x] Responsive design

---

## 📈 Performance

### Optimisations
- Index sur (householdId, status, dueDate)
- Cache reminders (5 min)
- Lazy load historique

### Requêtes
- GET reminders : < 200ms
- POST complete : < 100ms
- Sync patterns : < 1s (pour 50 patterns)

---

## 📋 Fichiers à Créer/Modifier

### Backend (~800 lignes)
```
src/
├── services/
│   └── reminderService.ts       (NEW, 350 lignes)
├── controllers/
│   └── reminderController.ts    (NEW, 450 lignes)
├── routes/
│   └── reminderRoutes.ts        (NEW, 50 lignes)
└── index.ts                     (MODIFY: routes)

prisma/
└── schema.prisma                (MODIFY: 2 models + relations)
```

### Frontend (~1,200 lignes)
```
src/
├── pages/
│   └── Reminders.tsx            (NEW, 250 lignes)
├── components/Reminders/
│   ├── ReminderForm.tsx         (NEW, 200 lignes)
│   ├── ReminderCard.tsx         (NEW, 150 lignes)
│   ├── ReminderDetailDialog.tsx (NEW, 250 lignes)
│   ├── ReminderList.tsx         (NEW, 150 lignes)
│   ├── ReminderStatsWidget.tsx  (NEW, 100 lignes)
│   ├── SnoozeDialog.tsx         (NEW, 100 lignes)
│   └── ReminderTimelineHistory.tsx (NEW, 120 lignes)
├── store/slices/
│   └── reminderSlice.ts         (NEW, 350 lignes)
├── services/
│   └── reminderService.ts       (NEW, 150 lignes)
└── App.tsx                      (MODIFY: route)

Total: ~2,000 lignes
```

---

## 🚀 Roadmap Phase 6C

### Semaine 1 : Backend
- [ ] Jour 1 : Prisma models
- [ ] Jour 2-3 : Services + Controllers
- [ ] Jour 4-5 : Tests

### Semaine 2 : Frontend
- [ ] Jour 1-2 : Pages + Components
- [ ] Jour 3 : Redux state
- [ ] Jour 4 : UX polish
- [ ] Jour 5 : Tests + Déploiement

---

## ✅ Critères de Succès Phase 6C

- [x] Tous endpoints fonctionnels
- [x] CRUD complet (Create, Read, Update, Delete)
- [x] Actions (Complete, Ignore, Snooze) fonctionnent
- [x] Auto-generation from patterns fonctionne
- [x] Historique enregistré
- [x] Stats correctes
- [x] UI responsive
- [x] Intégration Phase 5 OK
- [x] Tests passent
- [x] Documentation complète

---

## 🎁 Extensions Futures (Après Phase 6C)

1. **Notification Badge**
   - Badge compte des pending reminders
   - Affichage "X reminders pending"

2. **Récurrence de Reminders**
   - Pour reminders recurrents (ex: "rappel loyer" chaque mois)

3. **Reminders dans les Transactions**
   - Créer reminder directement depuis transaction

4. **Smart Reminders**
   - AI suggère rappels basés sur patterns
   - Rappels anomalies de dépenses

---

**Phase 6C - Reminders est prêt à être implémenté** ✨

