# Phase 7.2 - Collection Postman pour Tester le Partage Proportionnel

## Guide Rapide pour Postman/Insomnia

### Préparation

1. **Ouvre Postman ou Insomnia**
2. **Crée une nouvelle collection**: "Phase 7 - Partage Proportionnel"
3. **Ajoute une variable d'environnement:**
   - Nom: `base_url` → Valeur: `http://localhost:3030/api`
   - Nom: `household_id` → Valeur: `{ton-id-de-foyer}`
   - Nom: `token` → Valeur: `{ton-jwt-token}`
   - Nom: `account_id` → Valeur: `{ton-id-de-compte}` (optionnel)

### Comment obtenir le token

**Option 1: Console du navigateur**
```javascript
// Ouvre DevTools (F12) → Console
localStorage.getItem('token')
// Copie le token affiché (sans les guillemets)
```

**Option 2: React DevTools**
- Ouvre React DevTools
- Cherche le contexte AuthContext
- Copie le token

### Requests Postman

---

## 1️⃣ Récupérer la Configuration

**Nom:** Get Sharing Configuration
**Méthode:** GET
**URL:** `{{base_url}}/households/{{household_id}}/sharing-configuration`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:** (vide)

**Réponse attendue (200):**
```json
{
  "status": "success",
  "data": {
    "id": "clx...",
    "householdId": "clx...",
    "autoAdjustRatios": true,
    "ratioAdjustmentDay": 1,
    "salaryCategoryId": null,
    "proportionalAccounts": []
  }
}
```

---

## 2️⃣ Mettre à Jour la Configuration

**Nom:** Update Sharing Configuration
**Méthode:** PATCH
**URL:** `{{base_url}}/households/{{household_id}}/sharing-configuration`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "autoAdjustRatios": true,
  "ratioAdjustmentDay": 1,
  "salaryCategoryId": null,
  "proportionalAccounts": ["{{account_id}}"]
}
```

**Remplacer:**
- `{{account_id}}` par l'ID d'un compte partagé (ex: "Dépenses communes")

**Réponse attendue (200):**
```json
{
  "status": "success",
  "message": "Configuration mise à jour",
  "data": {
    "householdId": "clx...",
    "autoAdjustRatios": true,
    "ratioAdjustmentDay": 1,
    "salaryCategoryId": null,
    "proportionalAccounts": ["clx..."]
  }
}
```

---

## 3️⃣ Récupérer l'Analyse des Revenus

**Nom:** Get Income Analysis
**Méthode:** GET
**URL:** `{{base_url}}/households/{{household_id}}/income-analysis?year=2025&month=10`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:** (vide)

**Paramètres Query:**
- `year` = 2025
- `month` = 10 (octobre)

**Réponse attendue (200):**
```json
{
  "status": "success",
  "data": {
    "month": "2025-10",
    "members": [
      {
        "userId": "user-1",
        "name": "John Doe",
        "email": "john@example.com",
        "salary": 2000,
        "ratio": 57.14
      },
      {
        "userId": "user-2",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "salary": 1500,
        "ratio": 42.86
      }
    ],
    "totalIncome": 3500
  }
}
```

---

## 4️⃣ Appliquer les Ratios Manuellement

**Nom:** Apply Sharing Ratios
**Méthode:** POST
**URL:** `{{base_url}}/households/{{household_id}}/apply-sharing-ratios`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "year": 2025,
  "month": 10
}
```

**Paramètres:**
- `year` = 2025
- `month` = 10 (pour octobre, qui est le mois précédent)

**Réponse attendue (200):**
```json
{
  "status": "success",
  "message": "Ratios appliqués avec succès pour 2025-10",
  "data": {
    "user-1": 57.14,
    "user-2": 42.86
  }
}
```

---

## 5️⃣ Récupérer l'Historique

**Nom:** Get Sharing History
**Méthode:** GET
**URL:** `{{base_url}}/households/{{household_id}}/sharing-history?limit=24`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:** (vide)

**Paramètres Query:**
- `limit` = 24 (nombre de mois à récupérer)

**Réponse attendue (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "clx...",
      "householdId": "clx...",
      "accountId": null,
      "year": 2025,
      "month": 10,
      "ratios": {
        "user-1": 57.14,
        "user-2": 42.86
      },
      "incomes": {
        "user-1": 2000,
        "user-2": 1500
      },
      "totalIncome": "3500.00",
      "appliedAt": "2025-11-07T12:34:56.789Z",
      "appliedBy": "user-123",
      "calculatedAt": "2025-11-07T12:34:56.789Z",
      "createdAt": "2025-11-07T12:34:56.789Z"
    }
  ]
}
```

---

## Workflow de Test Complet

### Étape 1: Préparer les données

1. Crée un foyer avec 2 membres
2. Ajoute des transactions CREDIT (salaire) pour octobre:
   - Membre 1: €2000
   - Membre 2: €1500

### Étape 2: Configurer

1. Execute: **Get Sharing Configuration** (vérifier l'état actuel)
2. Execute: **Update Sharing Configuration**
   - Configure `autoAdjustRatios: true`
   - Configure `ratioAdjustmentDay: 1` (ou jour actuel)
   - Ajoute un compte à `proportionalAccounts`

### Étape 3: Analyser les revenus

1. Execute: **Get Income Analysis** avec `year=2025&month=10`
2. Vérifie les revenus affichés
3. Vérifie les ratios calculés

### Étape 4: Appliquer les ratios

1. Execute: **Apply Sharing Ratios** avec `year=2025&month=10`
2. Vérifie que les ratios sont retournés correctement
3. Attends environ 1-2 secondes (mise à jour de la BD)

### Étape 5: Vérifier l'historique

1. Execute: **Get Sharing History**
2. Vérifie que l'entrée la plus récente a:
   - Les bons mois/années
   - Les bons revenus et ratios
   - `appliedBy` = ton user ID
   - `calculatedAt` et `appliedAt` proches

### Étape 6: Tester avec un autre mois

1. Ajoute des transactions pour novembre:
   - Membre 1: €1500
   - Membre 2: €1400

2. Execute: **Apply Sharing Ratios** avec `year=2025&month=11`

3. Execute: **Get Income Analysis** avec `year=2025&month=11`
   - Ratios attendus:
     - Membre 1: 51.72%
     - Membre 2: 48.28%

---

## Troubleshooting

### Erreur: 401 Unauthorized
- **Cause:** Token invalide ou expiré
- **Solution:** Récupère un nouveau token via localStorage

### Erreur: 403 Forbidden
- **Cause:** Tu n'es pas ADMIN du foyer
- **Solution:** Promote-toi en ADMIN (via la UI ou API)

### Réponse vide pour les revenus
- **Cause:** Pas de transactions de salaire trouvées
- **Solution:**
  - Ajoute des CREDIT transactions dans la catégorie "Salaire"
  - Vérifie que le mois est correct
  - Vérifie que `salaryCategoryId` est null ou correct

### Ratios non appliqués
- **Cause:** `proportionalAccounts` vide
- **Solution:** Configure au moins un compte dans `proportionalAccounts`

### Erreur: "year et month sont requis"
- **Cause:** Les paramètres query ne sont pas passés
- **Solution:** Ajoute `?year=2025&month=10` à l'URL

---

## Importation dans Postman

Tu peux aussi importer cette collection directement:

**Fichier JSON (copia dans Postman):**
```json
{
  "info": {
    "name": "Phase 7 - Partage Proportionnel",
    "version": "1.0.0"
  },
  "variable": [
    {"key": "base_url", "value": "http://localhost:3000/api"},
    {"key": "household_id", "value": ""},
    {"key": "token", "value": ""},
    {"key": "account_id", "value": ""}
  ],
  "item": [
    {
      "name": "Get Sharing Configuration",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "url": {
          "raw": "{{base_url}}/households/{{household_id}}/sharing-configuration",
          "host": ["{{base_url}}"],
          "path": ["households", "{{household_id}}", "sharing-configuration"]
        }
      }
    },
    {
      "name": "Update Sharing Configuration",
      "request": {
        "method": "PATCH",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"autoAdjustRatios\": true, \"ratioAdjustmentDay\": 1, \"salaryCategoryId\": null, \"proportionalAccounts\": [\"{{account_id}}\"]}"
        },
        "url": {
          "raw": "{{base_url}}/households/{{household_id}}/sharing-configuration",
          "host": ["{{base_url}}"],
          "path": ["households", "{{household_id}}", "sharing-configuration"]
        }
      }
    },
    {
      "name": "Get Income Analysis",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "url": {
          "raw": "{{base_url}}/households/{{household_id}}/income-analysis?year=2025&month=10",
          "host": ["{{base_url}}"],
          "path": ["households", "{{household_id}}", "income-analysis"],
          "query": [
            {"key": "year", "value": "2025"},
            {"key": "month", "value": "10"}
          ]
        }
      }
    },
    {
      "name": "Apply Sharing Ratios",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"year\": 2025, \"month\": 10}"
        },
        "url": {
          "raw": "{{base_url}}/households/{{household_id}}/apply-sharing-ratios",
          "host": ["{{base_url}}"],
          "path": ["households", "{{household_id}}", "apply-sharing-ratios"]
        }
      }
    },
    {
      "name": "Get Sharing History",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "url": {
          "raw": "{{base_url}}/households/{{household_id}}/sharing-history?limit=24",
          "host": ["{{base_url}}"],
          "path": ["households", "{{household_id}}", "sharing-history"],
          "query": [
            {"key": "limit", "value": "24"}
          ]
        }
      }
    }
  ]
}
```

Copie ce JSON et importe-le dans Postman:
- Menu → Import → Paste Raw Text → Colle le JSON

---

## Résumé

✅ Configuration mise à jour
✅ Revenus calculés correctement
✅ Ratios appliqués manuellement
✅ Historique enregistré

Prêt pour tester le cron job automatique! 🚀
