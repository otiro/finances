# Phase 7.2 - Guide de Test du Partage Proportionnel

## Vue d'ensemble

Il y a 3 façons de tester la mise à jour automatique des ratios selon le salaire:

1. **Test via API (manuel immédiat)** ⭐ Recommandé pour tester rapidement
2. **Test via Cron Job (simulation du jour d'ajustement)**
3. **Test complet (attendre le jour configuré)**

---

## Méthode 1: Test Manuel via API (Rapide & Facile) ⭐

### Étape 1: Préparer les données de test

Crée un foyer avec 2 membres si tu n'en as pas:

1. Va sur l'app → Crée un foyer "TEST-Proportional-Sharing"
2. Ajoute un deuxième membre (invite un autre utilisateur)
3. Les deux membres doivent être ADMIN pour pouvoir configurer

### Étape 2: Ajouter des transactions de salaire

Pour chaque membre, crée des transactions CREDIT (salaire) dans la catégorie "Salaire" ou "Revenu":

**Membre 1:**
- Date: Octobre 2025
- Montant: €2000
- Type: CREDIT
- Catégorie: Salaire (ou Revenu)

**Membre 2:**
- Date: Octobre 2025
- Montant: €1500
- Type: CREDIT
- Catégorie: Salaire (ou Revenu)

### Étape 3: Configurer le partage proportionnel

Utilise les endpoints API (via Postman/Insomnia ou curl):

**A. Récupérer la configuration actuelle:**
```bash
curl -X GET http://localhost:3000/api/households/{id}/sharing-configuration \
  -H "Authorization: Bearer {token}"
```

**B. Mettre à jour la configuration:**
```bash
curl -X PATCH http://localhost:3000/api/households/{id}/sharing-configuration \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "autoAdjustRatios": true,
    "ratioAdjustmentDay": 1,
    "salaryCategoryId": null,
    "proportionalAccounts": ["{account_id}"]
  }'
```

**Remplace:**
- `{id}` = ID du foyer
- `{token}` = Ton JWT token
- `{account_id}` = ID d'un compte partagé (exemple: compte "Dépenses communes")
- `ratioAdjustmentDay` = Jour du mois (1-31) pour l'ajustement

### Étape 4: Appliquer les ratios manuellement

**Déclenche l'application manuelle des ratios pour octobre:**
```bash
curl -X POST http://localhost:3000/api/households/{id}/apply-sharing-ratios \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "month": 10
  }'
```

**Réponse attendue:**
```json
{
  "status": "success",
  "message": "Ratios appliqués avec succès pour 2025-10",
  "data": {
    "userId-1": 57.14,
    "userId-2": 42.86
  }
}
```

### Étape 5: Vérifier les ratios appliqués

**A. Via API - Analyse des revenus:**
```bash
curl -X GET "http://localhost:3000/api/households/{id}/income-analysis?year=2025&month=10" \
  -H "Authorization: Bearer {token}"
```

**Réponse attendue:**
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

**B. Via Base de Données:**
```sql
-- Vérifier dans la table SharingRatioHistory
SELECT * FROM "SharingRatioHistory"
WHERE "householdId" = '{id}'
ORDER BY "createdAt" DESC;

-- Résultat:
-- year: 2025
-- month: 10
-- ratios: {"user-1": 57.14, "user-2": 42.86}
-- incomes: {"user-1": 2000, "user-2": 1500}
-- appliedBy: {your-user-id}
```

**C. Via App Frontend:**
- Ouvre la page du foyer
- Les ratios de propriété du compte doivent être mis à jour
- (Note: Pas de page UI encore pour visualiser, voir Phase 7.3)

### Étape 6: Tester avec des revenus différents

**Ajoute des transactions pour novembre:**

Membre 1: €1500
Membre 2: €1400

**Applique les ratios pour novembre:**
```bash
curl -X POST http://localhost:3000/api/households/{id}/apply-sharing-ratios \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "month": 11
  }'
```

**Résultats attendus:**
```
Novembre 2025:
- Total income: 2900 EUR
- Membre 1: 1500 / 2900 = 51.72%
- Membre 2: 1400 / 2900 = 48.28%
```

**Vérifie que les ratios ont changé:**
```bash
curl -X GET "http://localhost:3000/api/households/{id}/income-analysis?year=2025&month=11" \
  -H "Authorization: Bearer {token}"
```

---

## Méthode 2: Tester le Cron Job Automatique

### Comment fonctionne le cron:

1. S'exécute quotidiennement (vérifié à chaque requête HTTP)
2. Cherche le jour d'ajustement configuré (défaut: 1er du mois)
3. Si aujourd'hui = jour d'ajustement ET autoAdjustRatios = true:
   - Calcule les ratios pour le MOIS PRÉCÉDENT
   - Applique aux comptes configurés
   - Enregistre dans l'historique

### Test du cron (simulation):

**Objectif:** Forcer le cron à s'exécuter aujourd'hui

**Étape 1: Modifier le jour d'ajustement à aujourd'hui**

```bash
# Si aujourd'hui c'est le 7 novembre:
curl -X PATCH http://localhost:3000/api/households/{id}/sharing-configuration \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "ratioAdjustmentDay": 7
  }'
```

**Étape 2: Redémarrer le serveur**

```bash
# Sur le RPi
npm run dev
```

Le cron job va:
1. Voir que aujourd'hui (7) = ratioAdjustmentDay (7)
2. Calculer les ratios pour octobre (mois précédent)
3. Appliquer les ratios
4. Enregistrer dans l'historique avec appliedBy = "SYSTEM"

**Étape 3: Vérifier que ça s'est exécuté**

```sql
SELECT * FROM "SharingRatioHistory"
WHERE "householdId" = '{id}'
AND "appliedBy" = 'SYSTEM'
ORDER BY "createdAt" DESC;
```

Tu dois voir une entrée avec:
- appliedBy: "SYSTEM"
- calculatedAt: d'aujourd'hui
- year/month: du mois précédent

---

## Méthode 3: Test Complet en Attente du Jour

### Long terme (pour validation finale):

1. **Configure le jour d'ajustement** (ex: 15 du mois)
2. **Ajoute des transactions de salaire** pour le mois en cours
3. **Attends le 15 du mois suivant**
4. **Vérified que les ratios se sont mis à jour automatiquement**

Avec `appliedBy: "SYSTEM"` dans l'historique.

---

## Cas de Test Importants

### Test 1: Revenu zéro

**Objectif:** Vérifier le fallback à parts égales

```bash
# Crée un foyer avec 3 membres
# Ajoute des transactions pour 2 membres, mais pas pour le 3ème

# Résultat attendu:
# - Si aucune transaction salaire pour personne: 33.33% / 33.33% / 33.33%
# - Parts égales pour tous
```

### Test 2: Un seul membre

**Objectif:** Vérifier qu'un seul membre = 100%

```bash
# Crée un foyer avec 1 seul membre
# Ajoute des transactions de salaire
# Applique les ratios

# Résultat attendu: 100%
```

### Test 3: Historique sur 24 mois

**Objectif:** Vérifier que l'historique se garde

```bash
# Applique les ratios 5 fois avec différentes dates/mois
# Récupère l'historique

curl -X GET "http://localhost:3000/api/households/{id}/sharing-history?limit=24" \
  -H "Authorization: Bearer {token}"

# Doit retourner 5 entrées avec les ratios corrects pour chaque mois
```

### Test 4: Permission check

**Objectif:** Vérifier que seul un ADMIN peut configurer

```bash
# Crée un foyer avec 2 membres
# Demote-toi en MEMBER
# Essaie de mettre à jour la configuration

# Résultat attendu: Erreur 403 FORBIDDEN
```

### Test 5: Pas de modifications si pas d'accounts configurés

**Objectif:** Vérifier que rien ne se passe si proportionalAccounts = []

```bash
# Configure: autoAdjustRatios = true
# Configure: proportionalAccounts = []
# Ajoute des transactions de salaire
# Applique les ratios

# Résultat: Aucun compte n'est modifié (mais historique enregistré)
```

---

## Commandes Curl Résumées

### Récupérer la configuration
```bash
curl -X GET http://localhost:3000/api/households/{id}/sharing-configuration \
  -H "Authorization: Bearer {token}"
```

### Mettre à jour la configuration
```bash
curl -X PATCH http://localhost:3000/api/households/{id}/sharing-configuration \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "autoAdjustRatios": true,
    "ratioAdjustmentDay": 1,
    "salaryCategoryId": null,
    "proportionalAccounts": ["{account-id}"]
  }'
```

### Appliquer les ratios manuellement
```bash
curl -X POST http://localhost:3000/api/households/{id}/apply-sharing-ratios \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"year": 2025, "month": 10}'
```

### Récupérer l'analyse des revenus
```bash
curl -X GET "http://localhost:3000/api/households/{id}/income-analysis?year=2025&month=10" \
  -H "Authorization: Bearer {token}"
```

### Récupérer l'historique
```bash
curl -X GET "http://localhost:3000/api/households/{id}/sharing-history?limit=24" \
  -H "Authorization: Bearer {token}"
```

---

## Troubleshooting

### Problème: Les ratios ne s'appliquent pas

**Causes possibles:**

1. **proportionalAccounts vide:**
   - Vérifie que tu as configuré les comptes
   - `proportionalAccounts` doit contenir au moins un ID de compte

2. **Pas de transactions de salaire:**
   - Ajoute des CREDIT transactions dans la catégorie "Salaire"
   - Le mois doit être < mois courant (ex: octobre si on est en novembre)

3. **Mauvaise catégorie:**
   - Vérifie le nom de la catégorie (case-sensitive)
   - Essaie avec `salaryCategoryId: null` pour utiliser la recherche automatique

4. **Comptes mal configurés:**
   - Vérifie que `proportionalAccounts` contient des IDs de compte existants
   - Les comptes doivent avoir plusieurs propriétaires

### Problème: L'historique ne s'enregistre pas

```sql
-- Vérifie que la table existe
SELECT * FROM "SharingRatioHistory" LIMIT 1;

-- Vérifie les données
SELECT "householdId", "year", "month", "appliedBy", "createdAt"
FROM "SharingRatioHistory"
ORDER BY "createdAt" DESC;
```

### Problème: Le cron job ne s'exécute pas

1. Vérifie les logs au démarrage du serveur:
   ```
   Sharing ratio adjustment job started
   ```

2. Vérifie que le jour d'ajustement correspond à aujourd'hui

3. Redémarre le serveur pour forcer une vérification

---

## Résumé des Attentes

✅ **Après application manuelle (Méthode 1):**
- Les ratios sont calculés correctement
- Ils sont enregistrés dans l'historique
- appliedBy = user ID
- Les propriétés des comptes sont mises à jour

✅ **Après test du cron (Méthode 2):**
- Les ratios se mettent à jour automatiquement
- appliedBy = "SYSTEM"
- Cela fonctionne le jour configuré

✅ **Après test complet (Méthode 3):**
- Aucune intervention manuelle nécessaire
- Les ratios se mettent à jour automatiquement chaque mois

---

## Prochaines Étapes (Phase 7.3)

Une fois que tu as validé les ratios via API:

1. **Créer une page "Analyse des Revenus"** pour visualiser les ratios
2. **Créer une page "Configuration du Partage"** pour gérer les paramètres
3. **Ajouter des graphiques** pour l'historique des ratios
4. **Implémenter des notifications** quand les ratios changent

Toutes les données sont déjà dans l'API, juste besoin de l'UI!

---

**Status:** Prêt pour les tests! 🧪
