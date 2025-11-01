# Guide de Test - Phase 4 : Gestion des Transactions

## Préparation

### Démarrer les services
```bash
# Terminal 1 - Backend
cd ~/finances/backend
npm run dev

# Terminal 2 - Frontend
cd ~/finances/frontend
npm run dev
```

### Prérequis
- Avoir complété Phase 3 (foyers, comptes, membres)
- Avoir au moins 1 foyer avec 2 membres
- Avoir au moins 1 compte JOINT avec 2 propriétaires

---

## Tests Backend (API)

### Test 1 : Créer une transaction (DEBIT)

```bash
curl -X POST http://localhost:3030/api/accounts/ACCOUNT_ID/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 50.50,
    "type": "DEBIT",
    "description": "Courses au supermarché",
    "transactionDate": "2025-11-01T10:30:00Z",
    "notes": "Carrefour Market"
  }'
```

**Résultat attendu :**
- Status 201
- Retourne la transaction créée avec user et montant
- Transaction en base : `SELECT * FROM transactions WHERE description = 'Courses au supermarché';`

---

### Test 2 : Créer une transaction (CREDIT)

```bash
curl -X POST http://localhost:3030/api/accounts/ACCOUNT_ID/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 100.00,
    "type": "CREDIT",
    "description": "Remboursement de dépense",
    "transactionDate": "2025-11-01T15:00:00Z"
  }'
```

**Résultat attendu :**
- Status 201
- Type = "CREDIT"
- Montant correct

---

### Test 3 : Récupérer les transactions d'un compte

```bash
curl http://localhost:3030/api/accounts/ACCOUNT_ID/transactions?limit=10&offset=0 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Résultat attendu :**
- Status 200
- Liste des transactions triées par date décroissante (plus récente d'abord)
- Pagination : `{ "transactions": [...], "total": 2, "limit": 10, "offset": 0 }`
- Chaque transaction inclut : user, amount, type, description, transactionDate

---

### Test 4 : Récupérer une transaction spécifique

```bash
curl http://localhost:3030/api/accounts/ACCOUNT_ID/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Résultat attendu :**
- Status 200
- Détails complets de la transaction
- Inclut user, category (si applicable), notes

---

### Test 5 : Modifier une transaction

```bash
curl -X PATCH http://localhost:3030/api/accounts/ACCOUNT_ID/transactions/TRANSACTION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "description": "Courses - MODIFIÉE",
    "amount": 55.75
  }'
```

**Résultat attendu :**
- Status 200
- Changements appliqués
- Vérifier en base : `SELECT description, amount FROM transactions WHERE id = 'TRANSACTION_ID';`

---

### Test 6 : Supprimer une transaction

```bash
curl -X DELETE http://localhost:3030/api/accounts/ACCOUNT_ID/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Résultat attendu :**
- Status 200
- Message : "Transaction supprimée avec succès"
- Vérifier : `SELECT * FROM transactions WHERE id = 'TRANSACTION_ID';` → zéro résultat

---

### Test 7 : Calculer les dettes d'un foyer (cas EQUAL)

**Scénario :**
```
Foyer: "Colocation" (Mode EQUAL)
Compte: "Charges" (Alice 50%, Bob 50%)
Transactions:
  - Alice: 100€ DEBIT
  - Bob: 0€ DEBIT

Résultat attendu:
  - Bob doit 50€ à Alice
```

**Étapes :**
1. Créer 2 transactions comme décrit ci-dessus
2. Appeler l'endpoint :

```bash
curl http://localhost:3030/api/households/HOUSEHOLD_ID/debts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Résultat attendu :**
- Status 200
- Retourne tableau de dettes :
  ```json
  [
    {
      "creditor": { "id": "alice-id", "firstName": "Alice", "lastName": "Dupont", "email": "alice@test.com" },
      "debtor": { "id": "bob-id", "firstName": "Bob", "lastName": "Martin", "email": "bob@test.com" },
      "amount": 50.00
    }
  ]
  ```

---

### Test 8 : Calculer les dettes (cas PROPORTIONAL)

**Scénario :**
```
Foyer: "Colocation" (Mode PROPORTIONAL)
Alice: 3000€/mois (60%)
Bob: 2000€/mois (40%)

Compte: "Charges" (Alice 60%, Bob 40%)
Transactions:
  - Alice: 100€ DEBIT → Solde: -100€
  - Bob: 0€

Calcul:
  - Alice doit: -100€ × 60% = -60€ (elle paye 60€)
  - Bob doit: -100€ × 40% = -40€ (il paie 40€)

  - Alice a payé: 100€, doit: 60€ → Crédit de 40€
  - Bob a payé: 0€, doit: 40€ → Doit 40€

Résultat: Bob doit 40€ à Alice
```

**Étapes :**
1. Créer foyer en mode PROPORTIONAL
2. Créer 2 utilisateurs avec revenus différents
3. Créer compte joint
4. Créer transactions
5. Vérifier : `GET /api/households/HOUSEHOLD_ID/debts`

---

### Test 9 : Vérifier les permissions (admin uniquement)

**Essayer de modifier/supprimer avec un non-admin :**

```bash
# Créer une transaction avec Alice (admin)
# Puis essayer de supprimer avec Bob (member)
curl -X DELETE http://localhost:3030/api/accounts/ACCOUNT_ID/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer BOB_TOKEN"
```

**Résultat attendu :**
- Status 403 Forbidden
- Message : "Seul un administrateur du foyer peut supprimer une transaction"

---

### Test 10 : Validation des données

**Test montant négatif :**
```bash
curl -X POST http://localhost:3030/api/accounts/ACCOUNT_ID/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{ "amount": -50, "type": "DEBIT", "description": "Test" }'
```

**Résultat attendu :**
- Status 400 Bad Request
- Message : "Le montant doit être positif"

**Test description vide :**
```bash
curl -X POST http://localhost:3030/api/accounts/ACCOUNT_ID/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{ "amount": 50, "type": "DEBIT", "description": "" }'
```

**Résultat attendu :**
- Status 400 Bad Request
- Message : "La description est requise"

---

## Tests Frontend (Interface)

### Flux 1 : Créer une transaction via UI

1. Aller à `/accounts/:id` (page détails d'un compte)
2. Scroller jusqu'à "Transactions récentes"
3. Cliquer sur bouton "Ajouter"
4. Dialog s'ouvre avec formulaire
5. Remplir :
   - Type : "Dépense" (DEBIT)
   - Montant : "45.50"
   - Description : "Épicerie"
   - Date : (aujourd'hui par défaut)
   - Notes : "Carrefour Market" (optionnel)
6. Cliquer "Ajouter"

**Résultat attendu :**
- Dialog se ferme
- Transaction apparaît en haut de la liste (plus récente d'abord)
- Affichage : "-45.50 €" en rouge
- Nom de l'utilisateur qui l'a créée
- Date au format "01/11/2025"

---

### Flux 2 : Créer un revenu

1. Même étapes que Flux 1
2. Sélectionner Type : "Revenu" (CREDIT)
3. Montant : "100.00"
4. Description : "Remboursement"
5. Ajouter

**Résultat attendu :**
- Transaction en vert
- Affichage : "+100.00 €"
- Solde actuel se met à jour

---

### Flux 3 : Validation du formulaire

**Test 1 - Montant manquant :**
1. Ouvrir AddTransactionDialog
2. Laisser montant vide
3. Cliquer "Ajouter"

**Résultat attendu :**
- Message d'erreur : "Le montant est requis"
- Bouton "Ajouter" reste désactivé

**Test 2 - Montant zéro :**
1. Entrer "0" dans montant
2. Cliquer "Ajouter"

**Résultat attendu :**
- Message d'erreur : "Le montant doit être un nombre positif"

**Test 3 - Description manquante :**
1. Remplir montant et type
2. Laisser description vide
3. Cliquer "Ajouter"

**Résultat attendu :**
- Message d'erreur : "La description est requise"

**Test 4 - Date future :**
1. Cliquer le champ date
2. Essayer de sélectionner une date future

**Résultat attendu :**
- Dates futures grisées/désactivées
- Impossible de les sélectionner

---

### Flux 4 : Supprimer une transaction

1. Sur `/accounts/:id` avec transactions
2. Localiser une transaction
3. Cliquer l'icône poubelle (🗑️) à droite

**Résultat attendu :**
- Dialog de confirmation s'affiche : "Êtes-vous sûr de vouloir supprimer cette transaction ?"
- Cliquer "OK"
- Transaction disparaît de la liste
- Solde actuel se met à jour

---

### Flux 5 : Recharger et persistance

1. Créer une transaction
2. Appuyer F5 (recharger la page)
3. Observer les transactions

**Résultat attendu :**
- Transaction toujours présente après rechargement
- Données chargées depuis le serveur
- Pas de duplication

---

### Flux 6 : Voir les dettes globales

1. Cliquer sur "Dettes et remboursements" (ou naviguer à `/debts`)
2. Observer la page

**Résultat attendu :**
- Page affiche tous les foyers
- Pour chaque foyer : liste des dettes au format "Alice doit 50€ à Bob"
- Section "Résumé par personne" en bas
- Couleurs : vert (créance), rouge (dette)

---

### Flux 7 : Scenario complet - Colocation

**Scénario :**
```
Foyer: "Colocation" (Mode EQUAL)
Membres: Alice, Bob, Charlie
Compte: "Dépenses partagées" (Alice 33%, Bob 33%, Charlie 33%)

Transactions:
1. Alice: 100€ (DEBIT) "Loyer"
2. Bob: 30€ (DEBIT) "Courses"
3. Charlie: 0€

Solde total: -130€
Chacun doit: -43.33€

Alice a payé: -100€, doit: -43.33€ → Crédit de 56.67€
Bob a payé: -30€, doit: -43.33€ → Doit 13.33€
Charlie a payé: 0€, doit: -43.33€ → Doit 43.33€
```

**Étapes :**
1. Avoir créé le foyer "Colocation" avec Alice (admin), Bob, Charlie
2. Foyer en mode "Parts égales" (EQUAL)
3. Créer compte "Dépenses partagées" avec les 3 propriétaires
4. Ajouter 3 transactions :
   - Alice : 100€ DEBIT "Loyer"
   - Bob : 30€ DEBIT "Courses"
5. Aller à `/debts`

**Résultat attendu :**
- Affiche :
  ```
  Bob doit 13.33€ à Alice (ou Charlie)
  Charlie doit 43.33€ à Alice (ou Bob)
  ```
- Section résumé :
  ```
  Alice: +56.67€ (dû 56.67€)
  Bob: -13.33€ (doit 13.33€)
  Charlie: -43.33€ (doit 43.33€)
  ```

---

### Flux 8 : Édition impossible (feature future)

1. Créer une transaction
2. Observer qu'il n'y a pas de bouton "Éditer" (juste supprimer)

**Résultat attendu :**
- Seule suppression disponible pour Phase 4
- L'édition sera ajoutée en Phase 4.5

---

### Flux 9 : Non-admin ne peut pas supprimer

1. Se connecter avec Alice (admin)
2. Créer une transaction sur un compte joint
3. Se déconnecter
4. Se connecter avec Bob (member)
5. Aller sur `/accounts/:id`
6. Cliquer supprimer

**Résultat attendu :**
- Dialog de suppression s'ouvre
- Cliquer OK
- Erreur 403 : "Seul un administrateur du foyer peut supprimer une transaction"
- Transaction ne disparaît pas

---

### Flux 10 : Formats et affichages

1. Créer plusieurs transactions avec différents montants
2. Observer les affichages

**Résultat attendu :**
- Montants toujours avec 2 décimales : "12.99 €"
- Dates au format français : "01/11/2025"
- Dates avec heure : "01/11/2025 • 14:30"
- Noms : "Alice Dupont"
- Types colorés : vert (+), rouge (-)

---

## Vérifications en Base de Données

### Vérifier les transactions créées

```sql
SELECT
  t.id,
  t.description,
  t.amount,
  t.type,
  t.transaction_date,
  u.first_name || ' ' || u.last_name AS user_name,
  a.name AS account_name
FROM transactions t
JOIN users u ON t.user_id = u.id
JOIN accounts a ON t.account_id = a.id
ORDER BY t.transaction_date DESC;
```

---

### Vérifier le solde d'un compte

```sql
SELECT
  a.name AS account_name,
  a.initial_balance,
  COALESCE(
    SUM(CASE WHEN t.type = 'CREDIT' THEN t.amount ELSE -t.amount END),
    0
  ) AS transactions_total,
  a.initial_balance + COALESCE(
    SUM(CASE WHEN t.type = 'CREDIT' THEN t.amount ELSE -t.amount END),
    0
  ) AS current_balance
FROM accounts a
LEFT JOIN transactions t ON a.id = t.account_id
WHERE a.id = 'ACCOUNT_ID'
GROUP BY a.id, a.name, a.initial_balance;
```

**Résultat attendu :**
```
account_name | initial_balance | transactions_total | current_balance
Charges      | 0.00           | -100.00            | -100.00
```

---

### Vérifier les dettes calculées manuellement

```sql
-- Transactions d'un compte
SELECT
  u.first_name,
  t.type,
  SUM(t.amount) AS total_amount
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.account_id = 'ACCOUNT_ID'
GROUP BY u.first_name, t.type
ORDER BY u.first_name;

-- Parts de propriété
SELECT
  u.first_name,
  ao.ownership_percentage
FROM account_owners ao
JOIN users u ON ao.user_id = u.id
WHERE ao.account_id = 'ACCOUNT_ID'
ORDER BY u.first_name;
```

---

### Vérifier que les dettes sont correctes

```sql
-- Exemple: Compte avec Alice 50%, Bob 50%
-- Solde: -100€
-- Alice a payé 100€, doit payer 50€ → Crédit 50€
-- Bob a payé 0€, doit payer 50€ → Doit 50€

SELECT
  t.account_id,
  a.name,
  a.initial_balance,
  SUM(CASE WHEN t.type = 'CREDIT' THEN t.amount ELSE -t.amount END) AS net_change,
  a.initial_balance + SUM(CASE WHEN t.type = 'CREDIT' THEN t.amount ELSE -t.amount END) AS total_balance
FROM accounts a
LEFT JOIN transactions t ON a.id = t.account_id
GROUP BY a.id, a.name, a.initial_balance;
```

---

## Tests de Sécurité

### Test 1 : Non-membre ne peut pas voir les transactions

1. Se connecter avec User A
2. Créer un foyer et des transactions
3. Se déconnecter et se connecter avec User B (non membre)
4. Essayer d'accéder directement à `/accounts/ACCOUNT_ID`

**Résultat attendu :**
- Erreur 403 ou redirection
- Message : "Accès refusé"

---

### Test 2 : Seulement admin peut modifier

1. Alice (admin) crée une transaction
2. Bob (member) essaie de supprimer

**Résultat attendu :**
- Erreur 403
- Message : "Seul un administrateur du foyer peut supprimer une transaction"

---

### Test 3 : Pas de montants bizarres

1. Essayer montant très grand : 999999.99
2. Essayer montant décimal : 0.01

**Résultat attendu :**
- 999999.99 : ✅ Accepté
- Supérieur à 999999.99 : ❌ Rejeté
- 0.01 : ✅ Accepté
- 0 ou négatif : ❌ Rejeté

---

## Checklist Finale

Cocher tous les items avant de valider Phase 4 :

### Backend
- [ ] Test 1 : Créer DEBIT ✅
- [ ] Test 2 : Créer CREDIT ✅
- [ ] Test 3 : Lister transactions ✅
- [ ] Test 4 : Récupérer une transaction ✅
- [ ] Test 5 : Modifier transaction ✅
- [ ] Test 6 : Supprimer transaction ✅
- [ ] Test 7 : Dettes (EQUAL) ✅
- [ ] Test 8 : Dettes (PROPORTIONAL) ✅
- [ ] Test 9 : Permissions ✅
- [ ] Test 10 : Validation ✅

### Frontend
- [ ] Flux 1 : Créer transaction ✅
- [ ] Flux 2 : Créer revenu ✅
- [ ] Flux 3 : Validation ✅
- [ ] Flux 4 : Supprimer ✅
- [ ] Flux 5 : Persistance ✅
- [ ] Flux 6 : Voir dettes ✅
- [ ] Flux 7 : Scenario complet ✅
- [ ] Flux 8 : Pas d'édition ✅
- [ ] Flux 9 : Permissions ✅
- [ ] Flux 10 : Formats ✅

### Sécurité
- [ ] Test 1 : Non-membre ✅
- [ ] Test 2 : Admin uniquement ✅
- [ ] Test 3 : Montants validés ✅

### Base de Données
- [ ] Transactions créées ✅
- [ ] Soldes corrects ✅
- [ ] Dettes calculées ✅

---

## Résultat Final

Après tous les tests, vous devriez avoir :
- ✅ Transactions créées (DEBIT et CREDIT)
- ✅ Modification et suppression fonctionnelles
- ✅ Dettes calculées correctement
- ✅ Page `/debts` fonctionnelle
- ✅ Sécurité vérifiée
- ✅ Validation complète
- ✅ Persistance des données

**🎉 Phase 4 validée avec succès !**

---

## Prochaine Étape

Une fois tous les tests validés, vous pourrez passer à la **Phase 4.5 : Améliorations Transactions** :
- Édition de transactions
- Catégorisation des transactions
- Filtrage par type/date/catégorie
- Marqueur "remboursé" pour les dettes
