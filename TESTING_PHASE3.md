# Guide de Test - Phase 3 : Gestion des comptes et foyers

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

## Tests Backend (API)

### Test 1 : Créer un foyer

```bash
curl -X POST http://localhost:3030/api/households \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZDIyNWY4Zi04ZmFmLTQzNjItYjkxOS02MTM3MDI5MzAxZWEiLCJlbWFpbCI6Imp1bGllbkB0ZXN0LmNvbSIsImlhdCI6MTc2MTk0OTM3NSwiZXhwIjoxNzYyMDM1Nzc1fQ.MzdcPki7aulKdU4pmf0VjycZNkGljOfXJ4LWnwHqMCk" \
  -d '{
    "name": "Famille Test",
    "sharingMode": "PROPORTIONAL"
  }'
```

**Résultat attendu :**
- Status 201
- Retourne le foyer créé avec l'utilisateur comme ADMIN
- Le foyer contient un membre (vous)

### Test 2 : Récupérer tous les foyers

```bash
curl http://localhost:3030/api/households \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZDIyNWY4Zi04ZmFmLTQzNjItYjkxOS02MTM3MDI5MzAxZWEiLCJlbWFpbCI6Imp1bGllbkB0ZXN0LmNvbSIsImlhdCI6MTc2MTk0OTM3NSwiZXhwIjoxNzYyMDM1Nzc1fQ.MzdcPki7aulKdU4pmf0VjycZNkGljOfXJ4LWnwHqMCk"
```

**Résultat attendu :**
- Status 200
- Liste des foyers avec nombre de comptes

### Test 3 : Ajouter un membre au foyer

**Prérequis :** Créer un deuxième utilisateur via `/api/auth/register`

```bash
curl -X POST http://localhost:3030/api/households/ea433d78-6001-464c-8071-21d3565b5da3/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZDIyNWY4Zi04ZmFmLTQzNjItYjkxOS02MTM3MDI5MzAxZWEiLCJlbWFpbCI6Imp1bGllbkB0ZXN0LmNvbSIsImlhdCI6MTc2MTk1MTA0MSwiZXhwIjoxNzYyMDM3NDQxfQ.OtOCDtdXCBCX1GbJ1bCz0OGICUa708kS1L6-Hy8znSQ" \
  -d '{
    "email": "test@test.com",
    "role": "MEMBER"
  }'
```

**Résultat attendu :**
- Status 201
- Le membre est ajouté au foyer

### Test 4 : Créer un compte PERSONAL

```bash
curl -X POST http://localhost:3030/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZDIyNWY4Zi04ZmFmLTQzNjItYjkxOS02MTM3MDI5MzAxZWEiLCJlbWFpbCI6Imp1bGllbkB0ZXN0LmNvbSIsImlhdCI6MTc2MTk1MTA0MSwiZXhwIjoxNzYyMDM3NDQxfQ.OtOCDtdXCBCX1GbJ1bCz0OGICUa708kS1L6-Hy8znSQ" \
  -d '{
    "name": "Compte courant Julien",
    "type": "CHECKING",
    "householdId": "ea433d78-6001-464c-8071-21d3565b5da3",
    "initialBalance": 0,
    "ownerIds": ["cd225f8f-8faf-4362-b919-6137029301ea"]
  }'
```

**Résultat attendu :**
- Status 201
- Compte créé avec `ownershipShare` = 100%

### Test 5 : Créer un compte JOINT avec mode PROPORTIONAL

**Contexte :**
- User 1 : 3000€/mois
- User 2 : 2000€/mois
- Total : 5000€

```bash
curl -X POST http://localhost:3030/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{
    "name": "Compte joint",
    "type": "JOINT",
    "householdId": "HOUSEHOLD_ID",
    "initialBalance": 5000,
    "ownerIds": ["USER_ID_1", "USER_ID_2"]
  }'
```

**Résultat attendu :**
- Status 201
- User 1 : `ownershipShare` = 60%
- User 2 : `ownershipShare` = 40%

### Test 6 : Récupérer le solde d'un compte

```bash
curl http://localhost:3030/api/accounts/ACCOUNT_ID/balance \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

**Résultat attendu :**
- Status 200
- Solde initial et solde actuel (identiques si pas de transactions)

### Test 7 : Modifier le mode de partage

```bash
curl -X PATCH http://localhost:3030/api/households/HOUSEHOLD_ID/sharing-mode \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{
    "sharingMode": "EQUAL"
  }'
```

**Résultat attendu :**
- Status 200
- Mode de partage mis à jour

## Tests Frontend (Interface)

### Flux 1 : Créer un foyer

1. Se connecter à http://moneypi.local:5173
2. Cliquer sur "Mes Foyers" dans le dashboard
3. Cliquer sur "Créer un foyer"
4. Remplir :
   - Nom : "Famille Dupont"
   - Mode de partage : "Proportionnel aux revenus"
5. Cliquer sur "Créer"

**Résultat attendu :**
- Dialog se ferme
- Le foyer apparaît dans la liste
- Badge "ADMIN" visible

### Flux 2 : Ajouter un membre

**Prérequis :** Créer un deuxième compte utilisateur

1. Aller dans "Mes Foyers"
2. Cliquer sur un foyer
3. Onglet "Membres"
4. Cliquer sur "Ajouter un membre"
5. Entrer l'email du deuxième utilisateur
6. Sélectionner le rôle "Membre"
7. Cliquer sur "Ajouter"

**Résultat attendu :**
- Le membre apparaît dans la liste
- Son revenu mensuel est affiché
- Badge "MEMBER" visible

### Flux 3 : Créer un compte joint

1. Dans les détails du foyer, onglet "Comptes"
2. Cliquer sur "Créer un compte"
3. Remplir :
   - Nom : "Compte joint"
   - Type : "Joint"
   - Solde initial : 5000
   - Cocher les deux membres comme propriétaires
4. Cliquer sur "Créer"

**Résultat attendu :**
- Le compte apparaît dans la liste
- Message indiquant le calcul automatique des parts
- Si mode PROPORTIONAL : parts calculées selon revenus

### Flux 4 : Voir les détails d'un compte

1. Cliquer sur "Voir les détails" d'un compte
2. Observer les informations affichées

**Résultat attendu :**
- Nom, type, foyer affichés
- Solde initial et actuel
- Liste des propriétaires avec leurs parts (%)
- Section "Transactions récentes" (vide pour l'instant)

### Flux 5 : Navigation Dashboard

1. Retourner au Dashboard
2. Observer les statistiques

**Résultat attendu :**
- Nombre de foyers correct
- Nombre total de comptes correct
- Les 3 derniers foyers affichés
- Liens "Voir les foyers" et "Voir les comptes" fonctionnels

### Flux 6 : Page "Tous les comptes"

1. Cliquer sur "Voir les comptes" dans le dashboard
2. Observer le tableau

**Résultat attendu :**
- Tous les comptes de tous les foyers affichés
- Colonnes : Nom, Type, Foyer, Propriétaires (avec %), Solde initial
- Bouton "œil" pour voir les détails

## Vérifications en base de données

### Vérifier les foyers créés

```sql
SELECT id, name, sharing_mode, created_at
FROM households;
```

### Vérifier les membres

```sql
SELECT
  h.name AS household_name,
  u.first_name,
  u.last_name,
  uh.role,
  u.monthly_income
FROM user_households uh
JOIN households h ON uh.household_id = h.id
JOIN users u ON uh.user_id = u.id
ORDER BY h.name, uh.role;
```

### Vérifier les comptes et parts

```sql
SELECT
  a.name AS account_name,
  a.type,
  a.initial_balance,
  h.name AS household_name,
  u.first_name || ' ' || u.last_name AS owner_name,
  ao.ownership_share
FROM accounts a
JOIN households h ON a.household_id = h.id
JOIN account_owners ao ON a.id = ao.account_id
JOIN users u ON ao.user_id = u.id
ORDER BY a.name, ao.ownership_share DESC;
```

**Vérifications importantes :**
- Pour un compte avec 2 propriétaires en mode EQUAL : 50% chacun
- Pour un compte en mode PROPORTIONAL : parts proportionnelles aux revenus
- La somme des parts doit toujours faire 100%

## Tests de sécurité

### Test 1 : Non-membre ne peut pas voir un foyer

1. Se connecter avec User 1
2. Créer un foyer
3. Se déconnecter et se connecter avec User 2
4. Essayer d'accéder directement à `/households/HOUSEHOLD_ID`

**Résultat attendu :**
- Erreur 403 ou message "Foyer non trouvé"

### Test 2 : Membre ne peut pas ajouter d'autres membres

1. Se connecter avec un utilisateur MEMBER (non admin)
2. Aller dans un foyer
3. Le bouton "Ajouter un membre" ne devrait pas être visible

**Résultat attendu :**
- Seuls les ADMIN voient le bouton

### Test 3 : Impossible de supprimer le dernier admin

1. Se connecter comme ADMIN
2. Essayer de se supprimer du foyer (si seul admin)

**Résultat attendu :**
- Erreur "Impossible de supprimer le dernier administrateur"

## Tests des calculs de parts

### Scénario 1 : Mode EQUAL avec 3 personnes

- User A, B, C avec revenus différents
- Créer un compte avec les 3 propriétaires
- Mode foyer : EQUAL

**Résultat attendu :**
- A : 33.33%
- B : 33.33%
- C : 33.34% (pour arrondir à 100%)

### Scénario 2 : Mode PROPORTIONAL

- User A : 3000€
- User B : 2000€
- User C : 1000€
- Total : 6000€

**Résultat attendu :**
- A : 50%
- B : 33.33%
- C : 16.67%

### Scénario 3 : Changement de mode de partage

1. Créer un foyer en mode EQUAL
2. Créer un compte avec 2 propriétaires (50% chacun)
3. Changer le mode du foyer en PROPORTIONAL
4. Créer un nouveau compte

**Résultat attendu :**
- Premier compte : reste à 50/50
- Nouveau compte : parts proportionnelles aux revenus

## Troubleshooting

### Erreur "Utilisateur non trouvé" lors de l'ajout d'un membre

- Vérifier que l'utilisateur existe :
  ```sql
  SELECT id, email, first_name, last_name FROM users WHERE email = 'email@example.com';
  ```

### Parts ne totalisent pas 100%

- Vérifier le calcul :
  ```sql
  SELECT account_id, SUM(ownership_share) AS total_share
  FROM account_owners
  GROUP BY account_id;
  ```

### Compte ne s'affiche pas

- Vérifier que l'utilisateur est membre du foyer :
  ```sql
  SELECT * FROM user_households
  WHERE user_id = 'USER_ID' AND household_id = 'HOUSEHOLD_ID';
  ```

## Résultat attendu final

Après tous les tests, vous devriez avoir :
- ✅ Au moins 2 foyers créés
- ✅ Plusieurs membres dans les foyers
- ✅ Différents types de comptes (PERSONAL, JOINT, SAVINGS)
- ✅ Parts calculées correctement selon le mode de partage
- ✅ Navigation fluide entre toutes les pages
- ✅ Dashboard avec statistiques à jour
- ✅ Sécurité : seuls les membres voient le foyer, seuls les admins gèrent les membres

**🎉 Phase 3 validée avec succès !**

## Prochaine étape

Une fois tous les tests validés, vous pourrez passer à la **Phase 4 : Gestion des transactions** :
- Créer des transactions (revenus et dépenses)
- Catégoriser les transactions
- Calculer les soldes en temps réel
- Créer des transactions récurrentes
- Gérer le rééquilibrage entre membres
