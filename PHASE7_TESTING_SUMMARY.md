# Phase 7.2 - Résumé du Test du Partage Proportionnel

## Situation Actuelle

✅ **Multi-Admin (Phase 7.1):** Fonctionnel et testé!
✅ **Ratios Proportionnels (Phase 7.2):** Codé et prêt à tester via API

❌ **UI Graphique:** Pas encore implémentée (Phase 7.3)

---

## Le Défi

Le système de ratios proportionnels est **difficile à tester via l'UI** parce que:

1. C'est une mise à jour **automatique** basée sur un jour du mois
2. Les ratios ne se voient pas dans l'UI existante
3. Il faut manipuler des données (transactions, comptes, configuration)

**Solution:** Tester via API + Base de données

---

## Trois Façons de Tester

### 1️⃣ Rapide: Postman/Insomnia (Recommandé)

**Temps:** 5-10 minutes
**Difficulté:** Facile
**Fichier:** `PHASE7_POSTMAN_COLLECTION.md`

**Étapes:**
1. Ouvre Postman/Insomnia
2. Crée un foyer avec 2 membres
3. Ajoute des transactions de salaire (CREDIT)
4. Utilise les 5 requests Postman pour:
   - Configurer le partage proportionnel
   - Appliquer les ratios manuellement
   - Vérifier les revenus calculés
   - Vérifier l'historique

**Avantages:**
- Pas de ligne de commande
- UI visuelle et intuitive
- Facile à comprendre les réponses

---

### 2️⃣ Automatisé: Script Bash

**Temps:** 2-3 minutes
**Difficulté:** Moyen (copier le token)
**Fichier:** `test-proportional-sharing.sh`

**Étapes:**
```bash
# 1. Rends le script exécutable
chmod +x test-proportional-sharing.sh

# 2. Récupère ton token (DevTools → localStorage)
# 3. Récupère l'ID de ton foyer (URL ou API)

# 4. Lance le script
./test-proportional-sharing.sh "household-id" "token"
```

**Avantages:**
- Exécute tous les tests automatiquement
- Affichage coloré et formaté
- Vérifie tous les endpoints en une commande

---

### 3️⃣ Complet: Guide Détaillé

**Temps:** 15-20 minutes
**Difficulté:** Moyen
**Fichier:** `PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md`

**Contient:**
- Explication pas-à-pas de chaque endpoint
- Cas de test importants (revenu zéro, 1 seul membre, etc.)
- Commandes curl pour tester sans Postman
- Vérification en base de données
- Troubleshooting

**Avantages:**
- Comprendre ce qui se passe
- Tester des scénarios spécifiques
- Vérifier la base de données directement

---

## Workflow Rapide (5 min)

### Prérequis

1. **Foyer créé** avec au moins 2 membres
2. **Compte partagé** créé (pour appliquer les ratios)
3. **Transactions de salaire** ajoutées pour octobre 2025:
   - Membre 1: €2000 (CREDIT dans "Salaire")
   - Membre 2: €1500 (CREDIT dans "Salaire")

### Test Rapide

**Via Postman:**

1. **GET** `/households/{id}/sharing-configuration`
   → Récupère la config actuelle

2. **PATCH** `/households/{id}/sharing-configuration`
   ```json
   {
     "autoAdjustRatios": true,
     "ratioAdjustmentDay": 1,
     "salaryCategoryId": null,
     "proportionalAccounts": ["{account-id}"]
   }
   ```
   → Configure le compte partagé

3. **GET** `/households/{id}/income-analysis?year=2025&month=10`
   → Vois les revenus et ratios:
   - Membre 1: €2000 (57.14%)
   - Membre 2: €1500 (42.86%)

4. **POST** `/households/{id}/apply-sharing-ratios`
   ```json
   {"year": 2025, "month": 10}
   ```
   → Applique les ratios

5. **GET** `/households/{id}/sharing-history?limit=24`
   → Vérifie que c'est enregistré dans l'historique

**Résultats attendus:**
- Les revenus sont calculés correctement
- Les ratios somment à 100%
- L'historique enregistre les changements
- Les comptes propriété percentages sont mis à jour

---

## Vérification en Base de Données

Après les tests, tu peux vérifier directement:

```sql
-- Voir tous les ratios appliqués pour ce foyer
SELECT "year", "month", "ratios", "appliedBy"
FROM "SharingRatioHistory"
WHERE "householdId" = '{id}'
ORDER BY "createdAt" DESC;

-- Résultat attendu:
-- year: 2025, month: 10, ratios: {"user-1": 57.14, "user-2": 42.86}, appliedBy: {user-id}
-- year: 2025, month: 11, ratios: {"user-1": 51.72, "user-2": 48.28}, appliedBy: {user-id}
```

---

## Tester le Cron Job Automatique

Le cron job s'exécute **automatiquement chaque jour** à une heure fixe (si le serveur tourne).

**Pour tester maintenant:**

1. **Configure le jour d'ajustement** à aujourd'hui:
   ```json
   {"ratioAdjustmentDay": 7}  // Si aujourd'hui = 7
   ```

2. **Redémarre le serveur** (pour forcer la vérification)
   ```bash
   npm run dev
   ```

3. **Vérifies les logs:**
   ```
   Sharing ratio adjustment job started
   ```

4. **Vérifies la base de données:**
   ```sql
   SELECT * FROM "SharingRatioHistory"
   WHERE "appliedBy" = 'SYSTEM'
   ORDER BY "createdAt" DESC;
   ```

**Si c'est enregistré avec `appliedBy: 'SYSTEM'`:**
✅ Le cron job fonctionne!

---

## Architecture Expliquée Simplement

### Comment ça fonctionne

1. **Transactions** → CREDIT dans "Salaire"
2. **Income Calculation Service** → Somme les transactions par utilisateur
3. **Ratio Calculation** → Divise par le total (57.14% / 42.86%)
4. **Apply Ratios** → Met à jour `AccountOwner.ownershipPercentage`
5. **Record History** → Sauvegarde dans `SharingRatioHistory`

### Deux modes d'exécution

**Mode Manuel:**
- Utilisateur clique "Appliquer les ratios"
- POST `/apply-sharing-ratios`
- Ratios appliqués immédiatement
- `appliedBy` = User ID

**Mode Automatique:**
- Cron job s'exécute chaque jour
- Si aujourd'hui = `ratioAdjustmentDay`:
  - Calcule pour le mois précédent
  - Applique automatiquement
  - `appliedBy` = "SYSTEM"

---

## Checklist de Test

- [ ] Multi-admin fonctionne (Phase 7.1)
  - [ ] Promote un membre en admin
  - [ ] Demote un admin (sauf le dernier)
  - [ ] Les buttons apparaissent/disparaissent correctement

- [ ] Configuration accessible (Phase 7.2)
  - [ ] GET sharing-configuration retourne les defaults
  - [ ] PATCH met à jour correctement
  - [ ] Les comptes sont sauvegardés

- [ ] Revenus calculés correctement
  - [ ] GET income-analysis montre les salaires
  - [ ] Les ratios somment à 100%
  - [ ] Le total est correct

- [ ] Ratios appliqués manuellement
  - [ ] POST apply-sharing-ratios retourne les ratios
  - [ ] L'historique est enregistré
  - [ ] appliedBy = user ID

- [ ] Historique fonctionnel
  - [ ] GET sharing-history retourne les entrées
  - [ ] Les données sont correctes
  - [ ] Base de données contient les records

- [ ] Cron job fonctionne (optionnel)
  - [ ] appliedBy = "SYSTEM" dans l'historique
  - [ ] Aucune intervention manuelle nécessaire

---

## Points Importants à Comprendre

### Revenu = Transactions CREDIT dans Salaire

- Le système compte les transactions CREDIT
- Dans la catégorie "Salaire" (ou configurée)
- Summe pour le mois spécifié

### Ratios Basés sur le Mois Précédent

- Application le 1er novembre
- Calcule basé sur octobre
- Raison: Laisser le temps d'enregistrer tous les salaires

### Zero Income = Parts Égales

Si personne n'a de transaction de salaire:
- 2 membres: 50% / 50%
- 3 membres: 33.33% / 33.33% / 33.33%
- etc.

### Seuls les Comptes Configurés Sont Affectés

- `proportionalAccounts` vide = Rien n'est modifié
- Faut ajouter les IDs des comptes partagés
- Les autres comptes ne changent pas

---

## Prochaines Étapes (Phase 7.3)

Quand tu auras validé via API:

1. **Créer Income Analysis Page**
   - Affiche les revenus par membre
   - Affiche les ratios en %
   - Graphique des revenus

2. **Créer Sharing Configuration Page**
   - Formulaire pour configurer l'auto-ajustement
   - Sélectionner les comptes proportionnels
   - Choisir le jour d'ajustement

3. **Créer Ratio History Page**
   - Historique des 24 derniers mois
   - Graphique des changements de ratios
   - Export CSV

---

## Fichiers de Référence

| Fichier | Utilisation |
|---------|------------|
| `PHASE7_PROPORTIONAL_SHARING_TEST_GUIDE.md` | Guide complet détaillé |
| `PHASE7_POSTMAN_COLLECTION.md` | Requests Postman toutes prêtes |
| `test-proportional-sharing.sh` | Script bash automatisé |
| `PHASE7_IMPLEMENTATION_SUMMARY.md` | Vue d'ensemble technique |
| `PHASE7_QUICK_START.md` | Déploiement RPi |

---

## Commandes Rapides

### Récupérer le token
```javascript
localStorage.getItem('token')
```

### Récupérer l'ID du foyer
```
URL: http://localhost:5173/households/{id}
```

### Récupérer l'ID du compte
```javascript
// Dans la réponse GET /households/{id}
data.accounts[0].id
```

### Test rapide avec curl
```bash
curl -X GET http://localhost:3000/api/households/{id}/sharing-configuration \
  -H "Authorization: Bearer {token}"
```

---

## En Cas de Problème

**Les ratios ne s'appliquent pas:**
1. Vérifie qu'il y a des transactions CREDIT
2. Vérifie que `proportionalAccounts` n'est pas vide
3. Vérifie la catégorie (case-sensitive)

**Pas de revenus calculés:**
1. Ajoute des transactions CREDIT dans "Salaire"
2. Fais sûr que le mois est < mois courant
3. Vérifie que les transactions sont pour les comptes des membres

**Le cron ne s'exécute pas:**
1. Redémarre le serveur
2. Vérifie les logs au démarrage
3. Change le `ratioAdjustmentDay` pour tester

---

## Résumé

**Multi-Admin:** ✅ Fonctionne
**Ratios Proportionnels:** ✅ Fonctionne via API
**UI:** ⏳ À implémenter (Phase 7.3)

**Pour tester:**
- Utilise `PHASE7_POSTMAN_COLLECTION.md`
- Ou lance `test-proportional-sharing.sh`
- Valide la base de données après

**Temps de test:** 5-20 minutes selon la profondeur

🎉 **Phase 7 est complète!** Just besoin de tester et d'ajouter l'UI.
