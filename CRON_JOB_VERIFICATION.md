# Vérification du Cron Job - Transactions Récurrentes

## 📌 Vue d'ensemble

Le cron job génère automatiquement les transactions récurrentes qui sont dues. Il y a **3 modes** disponibles :

| Mode | Fréquence | Utilisation |
|------|-----------|-------------|
| **Production** | 1x par jour à 00:00 UTC | Mode normal |
| **Hourly** | Toutes les heures | Tests/Staging |
| **Development** | Toutes les 5 minutes | Développement rapide |

## ✅ Méthode 1 : Vérifier via les Logs (Production)

### Sur ton Raspberry Pi

```bash
# Accès SSH
ssh julien@moneypi

# Aller au dossier du backend
cd ~/finances/backend

# Tail les logs en temps réel
tail -f backend.log

# Dans une autre session, tu verras à minuit (00:00 UTC) :
```

**Exemple de logs attendus :**
```
[2025-11-06 23:00:00] INFO [Cron Job] Starting recurring transaction generation...
[2025-11-06 23:00:00] INFO [Cron Job] Recurring transaction generation completed
[2025-11-06 23:00:00] INFO   - Success: 3
[2025-11-06 23:00:00] INFO   - Failed: 0
[2025-11-06 23:00:00] INFO   - Total: 3
```

### Filtrer les logs du cron job uniquement

```bash
grep "Cron Job" backend.log
```

---

## 🚀 Méthode 2 : Tester rapidement en Mode Development

Pour tester **sans attendre jusqu'à minuit**, change le mode en développement (exécution toutes les 5 minutes) :

### Étapes :

1. **Modifie `backend/src/index.ts`** (ligne 22 et 66) :

```typescript
// AVANT
import { startRecurringTransactionCronJob } from './jobs/recurringTransactionJob';
...
startRecurringTransactionCronJob();

// APRÈS (pour développement)
import { startRecurringTransactionCronJobDevelopment } from './jobs/recurringTransactionJob';
...
startRecurringTransactionCronJobDevelopment();
```

2. **Rebuild et redéploie** :
```bash
npm run build
# Puis redéploie sur Raspberry Pi
# Et redémarre le service
```

3. **Tail les logs** :
```bash
tail -f backend.log
```

Tu verras un message toutes les 5 minutes :
```
[2025-11-06 23:05:00] INFO [Cron Job - Dev] Generated 2 transaction(s)
```

---

## 🧪 Méthode 3 : Test Manuel Complet

### Étapes de test :

1. **Créer un pattern de test** :
   - Accède à `/recurring-transactions`
   - Créer une transaction avec :
     - **Fréquence** : DAILY
     - **Date de début** : Aujourd'hui
     - **Montant** : 100 €
     - **Compte** : Test compte
     - **Catégorie** : Optionnelle

2. **Vérifier la génération** :
   ```bash
   # Voir les logs du cron job
   tail -f ~/finances/backend.log | grep "Cron Job"

   # Vérifier les transactions créées en DB
   psql -U postgres -d finances -c "
     SELECT id, amount, type, created_at
     FROM transactions
     WHERE is_recurring = true
     ORDER BY created_at DESC
     LIMIT 10;
   "
   ```

3. **Vérifier dans le frontend** :
   - Accède à la page des transactions
   - Les transactions générées devraient apparaître dans l'historique

---

## 🔍 Vérifier Directement en Base de Données

### Voir les patterns récurrents créés :
```bash
psql -U postgres -d finances -c "
  SELECT id, name, frequency, start_date, next_generation_date, is_active
  FROM recurring_patterns
  ORDER BY created_at DESC;
"
```

### Voir les transactions générées par les patterns :
```bash
psql -U postgres -d finances -c "
  SELECT t.id, t.amount, t.type, t.is_recurring, t.created_at, rp.name as pattern_name
  FROM transactions t
  LEFT JOIN recurring_patterns rp ON t.recurring_pattern_id = rp.id
  WHERE t.is_recurring = true
  ORDER BY t.created_at DESC
  LIMIT 20;
"
```

### Voir l'historique de génération :
```bash
psql -U postgres -d finances -c "
  SELECT pattern_id, status, error, created_at
  FROM recurring_transaction_logs
  ORDER BY created_at DESC
  LIMIT 20;
"
```

---

## ⚠️ Troubleshooting

### Le cron job ne s'exécute pas

1. **Vérifier que le backend est running** :
   ```bash
   ps aux | grep "node\|ts-node"
   ```

2. **Vérifier les logs d'erreur** :
   ```bash
   tail -50 ~/finances/backend.log | grep -i error
   ```

3. **Vérifier la connexion DB** :
   ```bash
   psql -U postgres -d finances -c "SELECT 1;"
   ```

### Les transactions ne sont pas générées

1. **Vérifier les patterns existent** :
   ```bash
   psql -U postgres -d finances -c "SELECT COUNT(*) FROM recurring_patterns WHERE is_active = true;"
   ```

2. **Vérifier les dates** :
   - La `start_date` du pattern doit être ≤ aujourd'hui
   - La `next_generation_date` doit être ≤ aujourd'hui

3. **Vérifier les erreurs dans les logs** :
   ```bash
   grep -A5 "Cron Job.*failed\|error" ~/finances/backend.log
   ```

---

## 📊 Résumé de la Vérification

- ✅ Les logs affichent "[Cron Job]" messages
- ✅ Les transactions apparaissent dans la DB avec `is_recurring = true`
- ✅ La table `recurring_transaction_logs` contient les exécutions
- ✅ Le frontend affiche les transactions générées
