# Guide de Test - Phase 4.5 : Améliorations Transactions

## Préparation

### Démarrer les services
```bash
# Terminal 1 - Backend
cd ~/finances/backend
npm run build
npm run dev

# Terminal 2 - Frontend
cd ~/finances/frontend
npm run dev
```

### Prérequis
- Avoir complété Phase 4 (transactions de base)
- Avoir au moins 1 foyer avec 2 comptes
- Avoir au moins 2-3 transactions existantes

---

## Tests Backend (API)

### Test 1 : Récupérer les catégories disponibles

```bash
curl http://localhost:3030/api/households/ea433d78-6001-464c-8071-21d3565b5da3/categories \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZDIyNWY4Zi04ZmFmLTQzNjItYjkxOS02MTM3MDI5MzAxZWEiLCJlbWFpbCI6Imp1bGllbkB0ZXN0LmNvbSIsImlhdCI6MTc2MTk4NjU0MiwiZXhwIjoxNzYyMDcyOTQyfQ.BYb_YZ-iw_tZknQCuXkArmCfYhywJ62bIqh80Oq-U44"
```

**Résultat attendu :**
- Status 200
- Retourne un objet avec `system` et `household`:
  ```json
  {
    "system": [
      { "id": "cat1", "name": "Alimentaire", "color": "#FF5733", "isSystem": true },
      { "id": "cat2", "name": "Transport", "color": "#33FF57", "isSystem": true }
    ],
    "household": [
      { "id": "cat3", "name": "Loisirs", "color": "#3357FF", "isSystem": false }
    ]
  }
  ```

---

### Test 2 : Créer une transaction avec catégorie

```bash
curl -X POST http://localhost:3030/api/accounts/9235729d-9109-44a6-b518-c95d314ea8cc/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZDIyNWY4Zi04ZmFmLTQzNjItYjkxOS02MTM3MDI5MzAxZWEiLCJlbWFpbCI6Imp1bGllbkB0ZXN0LmNvbSIsImlhdCI6MTc2MTk4NjU0MiwiZXhwIjoxNzYyMDcyOTQyfQ.BYb_YZ-iw_tZknQCuXkArmCfYhywJ62bIqh80Oq-U44" \
  -d '{
    "amount": 15.50,
    "type": "DEBIT",
    "description": "Cinéma",
    "categoryId": "6d8a5c84-2ada-4bb3-8f2b-4264d987621f",
    "transactionDate": "2025-11-01T14:30:00Z"
  }'
```

**Résultat attendu :**
- Status 201
- Transaction créée avec catégorie
- Réponse inclut la catégorie dans les données

---

### Test 3 : Modifier une transaction

```bash
curl -X PATCH http://localhost:3030/api/accounts/ACCOUNT_ID/transactions/e39bc7a4-8c29-4c24-b859-02f0d189b41e \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZDIyNWY4Zi04ZmFmLTQzNjItYjkxOS02MTM3MDI5MzAxZWEiLCJlbWFpbCI6Imp1bGllbkB0ZXN0LmNvbSIsImlhdCI6MTc2MTk4NjU0MiwiZXhwIjoxNzYyMDcyOTQyfQ.BYb_YZ-iw_tZknQCuXkArmCfYhywJ62bIqh80Oq-U44" \
  -d '{
    "description": "restaurant - MODIFIÉE",
    "amount": 30.00,
    "categoryId": "5cc6735d-3c3e-4ece-9e57-a2327eb1229e"
  }'
```

**Résultat attendu :**
- Status 200
- Modifications appliquées
- Transaction mise à jour avec nouvelle catégorie

---

### Test 4 : Créer une catégorie personnalisée

```bash
curl -X POST http://localhost:3030/api/households/ea433d78-6001-464c-8071-21d3565b5da3/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZDIyNWY4Zi04ZmFmLTQzNjItYjkxOS02MTM3MDI5MzAxZWEiLCJlbWFpbCI6Imp1bGllbkB0ZXN0LmNvbSIsImlhdCI6MTc2MTk4NjU0MiwiZXhwIjoxNzYyMDcyOTQyfQ.BYb_YZ-iw_tZknQCuXkArmCfYhywJ62bIqh80Oq-U44" \
  -d '{
    "name": "Restaurant",
    "color": "#FF001B"
  }'
```

**Résultat attendu :**
- Status 201
- Catégorie créée avec isSystem=false
- Retourne l'objet catégorie créé

---

### Test 5 : Non-admin ne peut pas créer de catégorie

```bash
curl -X POST http://localhost:3030/api/households/HOUSEHOLD_ID/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MEMBER_TOKEN" \
  -d '{ "name": "Test", "color": "#000000" }'
```

**Résultat attendu :**
- Status 403
- Message : "Seul un administrateur peut créer des catégories"

---

### Test 6 : Modifier une catégorie

```bash
curl -X PATCH http://localhost:3030/api/households/ea433d78-6001-464c-8071-21d3565b5da3/categories/CATEGORY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZDIyNWY4Zi04ZmFmLTQzNjItYjkxOS02MTM3MDI5MzAxZWEiLCJlbWFpbCI6Imp1bGllbkB0ZXN0LmNvbSIsImlhdCI6MTc2MTk4NjU0MiwiZXhwIjoxNzYyMDcyOTQyfQ.BYb_YZ-iw_tZknQCuXkArmCfYhywJ62bIqh80Oq-U44" \
  -d '{
    "name": "Restaurant Premium",
    "color": "#FF6B9D"
  }'
```

**Résultat attendu :**
- Status 200
- Catégorie mise à jour avec nouveau nom et couleur
- Retourne l'objet catégorie modifié

---

### Test 7 : Supprimer une catégorie (si non utilisée)

```bash
curl -X DELETE http://localhost:3030/api/households/ea433d78-6001-464c-8071-21d3565b5da3/categories/CATEGORY_ID \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjZDIyNWY4Zi04ZmFmLTQzNjItYjkxOS02MTM3MDI5MzAxZWEiLCJlbWFpbCI6Imp1bGllbkB0ZXN0LmNvbSIsImlhdCI6MTc2MTk4NjU0MiwiZXhwIjoxNzYyMDcyOTQyfQ.BYb_YZ-iw_tZknQCuXkArmCfYhywJ62bIqh80Oq-U44"
```

**Résultat attendu :**
- Status 200
- Catégorie supprimée (si aucune transaction ne l'utilise)
- Message : "Catégorie supprimée avec succès"

**Si la catégorie est utilisée :**
- Status 409 (Conflict)
- Message : "Impossible de supprimer une catégorie utilisée par des transactions"

---

## Tests Frontend (Interface)

### Flux 1 : Ajouter une transaction avec catégorie

1. Aller à `/accounts/:id`
2. Cliquer "Ajouter" (bouton dans "Transactions récentes")
3. Dialog s'ouvre
4. Remplir le formulaire :
   - Type : "Dépense"
   - Montant : "45.50"
   - Description : "Épicerie"
   - **Catégorie : Sélectionner "Alimentaire"** (nouveau!)
   - Date : 01/11/2025 14:30
5. Cliquer "Ajouter"

**Résultat attendu :**
- Dialog se ferme
- Transaction apparaît avec la catégorie affichée
- Format: "Épicerie • Alimentaire • 01/11/2025 à 14:30"

---

### Flux 2 : Modifier une transaction existante

**Prérequis :** Une transaction existante est visible

1. Localiser une transaction dans la liste
2. Observer qu'il y a un **bouton "Modifier"** (nouveau!) ou **double-cliquer** sur la ligne
3. Un dialog "Modifier la transaction" s'ouvre
4. Modifier la description : "Courses → Courses biologiques"
5. Modifier la catégorie
6. Cliquer "Enregistrer"

**Résultat attendu :**
- Dialog se ferme
- Transaction mise à jour dans la liste
- Les modifications sont reflétées immédiatement

---

### Flux 3 : Filtrer les transactions par type

1. Sur `/accounts/:id` page
2. Localiser une **section "Filtres"** (nouveau!) en haut de la liste
3. Cocher "Dépenses uniquement" (DEBIT)
4. Observer que seules les transactions DEBIT s'affichent
5. Décocher le filtre

**Résultat attendu :**
- Filtrage fonctionne en temps réel
- Les transactions CREDIT disparaissent
- Compteur mis à jour : "3 transactions filtrées sur 5"

---

### Flux 4 : Filtrer par catégorie

1. Sur `/accounts/:id` page
2. Localiser le **dropdown "Catégorie"** dans la section filtres
3. Sélectionner "Alimentaire"
4. Observer que seules les transactions avec cette catégorie s'affichent
5. Sélectionner une autre catégorie

**Résultat attendu :**
- Filtrage par catégorie fonctionne
- Les transactions sans catégorie ne s'affichent que si "Aucune" est sélectionné

---

### Flux 5 : Filtrer par plage de dates

1. Sur `/accounts/:id` page
2. Localiser les **champs "Du" et "Au"** dans les filtres
3. Sélectionner "Du: 01/11/2025" "Au: 15/11/2025"
4. Observer que seules les transactions dans cette plage s'affichent
5. Modifier les dates

**Résultat attendu :**
- Filtrage par date fonctionne
- Les transactions en dehors de la plage disparaissent
- On peut combiner filtres : type + catégorie + date

---

### Flux 6 : Réinitialiser tous les filtres

1. Appliquer plusieurs filtres
2. Localiser un **bouton "Réinitialiser les filtres"**
3. Cliquer dessus

**Résultat attendu :**
- Tous les filtres sont vidés
- Toutes les transactions réapparaissent

---

### Flux 7 : Affichage des catégories dans la liste

1. Créer 2-3 transactions avec des catégories différentes
2. Observer la liste des transactions

**Résultat attendu :**
- Chaque transaction affiche son badge de catégorie
- Format: `[Catégorie avec couleur] Montant`
- Les catégories sans couleur ont une couleur par défaut

---

### Flux 7b : Modifier une catégorie personnalisée

1. Aller à la page du foyer (`/households/:id`)
2. Cliquer sur l'onglet "Catégories"
3. Localiser une catégorie personnalisée (pas "système")
4. Cliquer sur le bouton **Modifier** (icône crayon)
5. Un dialog s'ouvre pour modifier le nom et la couleur
6. Modifier le nom: "Alimentaire" → "Alimentation"
7. Changer la couleur
8. Cliquer "Enregistrer"

**Résultat attendu :**
- La catégorie est mise à jour dans la liste
- Les transactions utilisant cette catégorie reflètent le nouveau nom
- La couleur change dans les badges des transactions

---

### Flux 7c : Supprimer une catégorie personnalisée

1. Aller à la page du foyer (`/households/:id`)
2. Cliquer sur l'onglet "Catégories"
3. Localiser une catégorie personnalisée (pas "système")
4. Cliquer sur le bouton **Supprimer** (icône poubelle)
5. Une confirmation apparaît
6. Confirmer la suppression

**Résultat attendu (si catégorie non utilisée) :**
- La catégorie disparaît de la liste
- Les transactions ne sont pas affectées
- Message de succès

**Résultat attendu (si catégorie utilisée par une transaction) :**
- Une erreur apparaît: "Impossible de supprimer une catégorie utilisée par des transactions"
- La catégorie reste dans la liste

---

### Flux 8 : Marquer une dette comme remboursée

1. Aller à `/debts`
2. Localiser une dette existante : "Alice doit 50€ à Bob"
3. Observer une **case à cocher** ou **bouton "Marquer comme remboursée"** (nouveau!)
4. Cliquer dessus

**Résultat attendu :**
- La dette affiche un statut "✅ Remboursée"
- Le montant apparaît barré ou grisé
- Elle peut être dé-marquée en recliquant

---

### Flux 9 : Filtre "Dettes en attente" vs "Dettes remboursées"

1. Sur `/debts`
2. Localiser des **onglets ou filtres** : "En attente", "Remboursées", "Toutes"
3. Marquer une dette comme remboursée
4. Cliquer sur "En attente"

**Résultat attendu :**
- La dette remboursée disparaît du filtre "En attente"
- Elle réapparaît dans "Remboursées"
- "Toutes" affiche les deux

---

### Flux 10 : Historique des remboursements

1. Sur `/debts`
2. Localiser une dette marquée comme remboursée
3. Observer un **texte "Remboursée le [date]"** ou une **icône de date** (nouveau!)

**Résultat attendu :**
- La date du remboursement s'affiche
- Format: "Remboursée le 02/11/2025"

---

## Tests de Sécurité

### Test 1 : Non-propriétaire ne peut pas modifier

1. User A crée une transaction
2. Se déconnecter et se connecter avec User B (autre propriétaire)
3. Essayer de modifier la transaction

**Résultat attendu :**
- Status 403
- Message : "Seul un administrateur du foyer peut modifier une transaction"

---

### Test 2 : Filtres ne divulguent pas les données cachées

1. User A a des transactions privées
2. User B (non propriétaire) essaie de voir `/accounts/A_ACCOUNT_ID`

**Résultat attendu :**
- Erreur 403
- Le filtrage ne permet pas de contourner l'authentification

---

### Test 3 : Les catégories sont isolées par foyer

1. Foyer A crée catégorie "Personnel"
2. Foyer B crée catégorie "Personnel"
3. Vérifier qu'elles ont des IDs différents
4. Vérifier que les transactions ne se mélangent pas

**Résultat attendu :**
- Chaque foyer a ses catégories
- Les utilisateurs d'un foyer ne voient que les catégories de ce foyer

---

## Tests de Persistance

### Test 1 : Modifications persistent après rechargement

1. Modifier une transaction
2. Appuyer F5 pour recharger la page
3. Observer la liste des transactions

**Résultat attendu :**
- Les modifications sont toujours présentes
- Pas de perte de données

---

### Test 2 : Les filtres ne persistent pas (comme prévu)

1. Appliquer des filtres
2. Recharger la page (F5)

**Résultat attendu :**
- Les filtres sont réinitialisés
- Toutes les transactions réapparaissent
- (Comportement normal pour Phase 4.5)

---

## Scenario Complet

### Colocation avec modifications

**Scénario :**
```
Foyer: "Colocation" (Mode EQUAL)
Membres: Alice (admin), Bob, Charlie
Compte: "Dépenses partagées"

Transactions initiales:
1. Alice: 100€ DEBIT "Loyer" → Catégorie "Logement"
2. Bob: 30€ DEBIT "Courses" → Catégorie "Alimentation"
3. Charlie: 20€ DEBIT "Internet" → Catégorie "Services"
```

**Étapes :**
1. Créer les 3 transactions avec catégories
2. Aller à `/accounts/ACCOUNT_ID`
3. Filtrer : "Alimentation" → Voir only Bob's transaction
4. Filtrer : "Dépense uniquement" + "Logement"
5. Modifier la transaction d'Alice : Changer montant 100€ → 110€
6. Aller à `/debts`
7. Vérifier que les dettes sont recalculées avec le nouveau montant
8. Marquer 1 dette comme remboursée

**Résultat attendu :**
- Filtres fonctionnent
- Modifications reflétées dans le calcul des dettes
- Les remboursements sont traçables

---

## Checklist Finale

### Backend
- [ ] Test 1 : Récupérer catégories ✅
- [ ] Test 2 : Créer transaction avec catégorie ✅
- [ ] Test 3 : Modifier transaction ✅
- [ ] Test 4 : Créer catégorie personnalisée ✅
- [ ] Test 5 : Permission admin ✅
- [ ] Test 6 : Modifier une catégorie ✅
- [ ] Test 7 : Supprimer une catégorie ✅

### Frontend - Transactions
- [ ] Flux 1 : Ajouter avec catégorie ✅
- [ ] Flux 2 : Modifier transaction ✅
- [ ] Flux 3 : Filtrer par type ✅
- [ ] Flux 4 : Filtrer par catégorie ✅
- [ ] Flux 5 : Filtrer par date ✅
- [ ] Flux 6 : Réinitialiser filtres ✅
- [ ] Flux 7 : Affichage catégories ✅
- [ ] Flux 7b : Modifier une catégorie ✅
- [ ] Flux 7c : Supprimer une catégorie ✅

### Frontend - Dettes
- [ ] Flux 8 : Marquer comme remboursée ✅
- [ ] Flux 9 : Filtres remboursement ✅
- [ ] Flux 10 : Historique remboursement ✅

### Sécurité
- [ ] Test 1 : Permissions modification ✅
- [ ] Test 2 : Filtres sécurisés ✅
- [ ] Test 3 : Catégories isolées ✅

### Persistance
- [ ] Test 1 : Modifications persistent ✅
- [ ] Test 2 : Filtres réinitialisés ✅

### Scenario Complet
- [ ] Colocation avec filtres et modifications ✅

---

## Notes Supplémentaires

### Priorité des implémentations

**Phase 4.5 MVP (Minimum Viable Product):**
1. ✅ Édition de transactions
2. ✅ Support des catégories
3. ✅ Filtrage basique (type, catégorie, date)
4. ✅ Marqueur "remboursé" pour dettes

**Phase 4.6 (Améliorations futures):**
- Export des transactions (CSV, PDF)
- Récurrence automatique des transactions
- Diagrammes d'analyse (pie chart, histogramme)
- Notifications de budget dépassé
- Mémorisation des catégories fréquentes

---

## Résultat Final

Après tous les tests, vous devriez avoir :
- ✅ Édition complète des transactions
- ✅ Catégorisation et filtrage
- ✅ Tracking des remboursements de dettes
- ✅ Persistance des données
- ✅ Sécurité vérifiée

**🎉 Phase 4.5 validée avec succès !**

---

## Prochaine Étape

Une fois tous les tests validés, vous pourrez passer à la **Phase 5 : Analytics & Reporting** :
- Tableau de bord d'analyse
- Graphiques de dépenses
- Rapports mensuels
- Prédictions budgétaires
