# Testing Phase 5.3 - Dashboard Widget Récurrences

## 📋 Vue d'ensemble

Phase 5.3 ajoute un **widget de gestion des transactions récurrentes** sur le dashboard du foyer. Le widget affiche un aperçu des patterns récurrents actifs et les prochaines transactions dues.

## 🎯 Fonctionnalités à Tester

### 1. Affichage du Widget - Aperçu des Patterns

**Scénario** : Accéder à la page HouseholdDetails
- **Étapes** :
  1. Naviguer vers `/dashboard`
  2. Cliquer sur un foyer pour ouvrir HouseholdDetails
  3. Cliquer sur l'onglet "Aperçu"

- **Attentes** :
  - ✅ Le widget "Transactions Récurrentes" s'affiche
  - ✅ La page se charge sans erreur

---

### 2. Widget Vide (Aucun Pattern)

**Scénario** : Affichage quand aucun pattern n'existe
- **Attentes** :
  - ✅ Message "Aucune transaction récurrente configurée"
  - ✅ Bouton "Créer une transaction" visible
  - ✅ Cliquer le bouton redirige vers `/recurring-transactions`

---

### 3. Statistiques du Widget

**Scénario** : Affichage avec patterns actifs
- **Prérequis** : Créer au moins 2 patterns DEBIT et 1 pattern CREDIT dans Phase 5.2
  - Pattern 1: Loyer 500€ DEBIT
  - Pattern 2: Électricité 100€ DEBIT
  - Pattern 3: Salaire 2000€ CREDIT

- **Étapes** :
  1. Aller à l'onglet "Aperçu"
  2. Observer les statistiques

- **Attentes** :
  - ✅ "Dépenses" affiche ~600 (somme des débits)
  - ✅ "Revenus" affiche ~2000 (somme des crédits)
  - ✅ "Actifs" affiche 3
  - ✅ "En pause" affiche 0 (ou nombre correct de paused)
  - ✅ Icônes TrendingUp/Down correctes

---

### 4. Liste des Prochaines Transactions

**Scénario** : Affichage des 5 prochaines transactions
- **Prérequis** : Patterns du scénario 3

- **Étapes** :
  1. Aller à l'onglet "Aperçu"
  2. Regarder la liste "Prochaines transactions"

- **Attentes** :
  - ✅ Maximum 5 patterns listés
  - ✅ Triés par `nextGenerationDate` (ordre croissant)
  - ✅ Chaque pattern affiche :
    - Nom du pattern
    - Icône pause si pausé
    - Date de prochaine génération (format court ex: "sam. 8 nov.")
    - Montant avec signe (+/-) et couleur (rouge pour DEBIT, vert pour CREDIT)

---

### 5. Formatage des Dates et Montants

**Scénario** : Vérifier le formatage
- **Étapes** :
  1. Observer une transaction dans la liste

- **Attentes** :
  - ✅ Date format locale français : "sam. 8 nov."
  - ✅ Montant affiche 2 décimales : "- 100.00 €"
  - ✅ DEBIT en rouge avec "-"
  - ✅ CREDIT en vert avec "+"

---

### 6. Bouton Rafraîchir

**Scénario** : Actualiser les données du widget
- **Étapes** :
  1. Cliquer le bouton "Rafraîchir" dans les actions

- **Attentes** :
  - ✅ Les données se rechargent
  - ✅ Pas d'erreur affichée
  - ✅ Le contenu se met à jour si changements

---

### 7. Bouton "Voir tous"

**Scénario** : Naviguer vers la page complète de gestion
- **Étapes** :
  1. Cliquer le bouton "Voir tous"

- **Attentes** :
  - ✅ Redirection vers `/households/:id/recurring-transactions`
  - ✅ La page complète s'ouvre avec tous les patterns

---

### 8. Patterns en Pause

**Scénario** : Affichage des patterns pausés
- **Prérequis** : Créer un pattern et le mettre en pause dans Phase 5.2

- **Étapes** :
  1. Aller à l'onglet "Aperçu"
  2. Observer le widget

- **Attentes** :
  - ✅ Le header affiche le nombre en pause : "3 actifs, 1 en pause"
  - ✅ Les patterns pausés n'apparaissent PAS dans "Prochaines transactions"
  - ✅ L'icône pause ⏸️ visible si pattern en pause dans la liste

---

### 9. Card Informations du Foyer

**Scénario** : Affichage des infos supplémentaires
- **Étapes** :
  1. Aller à l'onglet "Aperçu"
  2. Observer la card "Informations du foyer" à droite

- **Attentes** :
  - ✅ Mode de partage affichée avec chip
  - ✅ Bouton "Modifier" visible pour l'ADMIN
  - ✅ Statistiques correctes :
    - Membres : N
    - Comptes : N
    - Catégories : N

---

### 10. Tab Navigation

**Scénario** : Naviguer entre les tabs
- **Étapes** :
  1. Cliquer sur différents tabs : Aperçu → Membres → Comptes → Catégories → Transactions Récurrentes
  2. Cliquer retour sur "Aperçu"

- **Attentes** :
  - ✅ Chaque tab charge correctement
  - ✅ Pas d'erreurs console
  - ✅ Le widget se recharge quand on revient à "Aperçu"

---

### 11. État de Chargement

**Scénario** : Afficher le loader pendant le chargement
- **Étapes** :
  1. Accéder à l'onglet "Aperçu"
  2. Observer rapidement avant le chargement complet

- **Attentes** :
  - ✅ Spinner CircularProgress affiche pendant ~1-2s
  - ✅ Pas de crash ou erreur
  - ✅ Les données s'affichent correctement après

---

### 12. Gestion d'Erreurs

**Scénario** : Erreur lors du chargement des patterns
- **Étapes** :
  1. Déconnecter la connexion réseau (ou arrêter le backend)
  2. Aller à l'onglet "Aperçu"
  3. Attendre le chargement

- **Attentes** :
  - ✅ Message d'erreur affichée : "Erreur lors du chargement..."
  - ✅ Pas de crash
  - ✅ Bouton "Rafraîchir" disponible pour réessayer

---

## 📱 Tests Responsive

### Desktop (1920px)
- ✅ Widget et card Infos affichés côte à côte (2 colonnes)
- ✅ Statistiques bien espacées
- ✅ Texte lisible

### Tablet (768px)
- ✅ Widget et card empilés (1 colonne)
- ✅ Statistiques en grille 2x2
- ✅ Boutons accessibles

### Mobile (375px)
- ✅ Layout vertical
- ✅ Statistiques empilées (1 colonne)
- ✅ Boutons large et cliquables
- ✅ Pas de text overflow

---

## 🔄 Intégration avec Phase 5.2

### Fluxcohérence des données
- ✅ Les patterns créés en Phase 5.2 s'affichent dans le widget
- ✅ Les modifications (édition, suppression) se reflètent après rafraîchissement
- ✅ Les patterns avec nextGenerationDate dans le futur s'affichent

---

## ✅ Checklist Finale

- [ ] Widget s'affiche sans erreur
- [ ] Statistiques correctes
- [ ] Prochaines transactions listées et triées
- [ ] Formatage des dates en français
- [ ] Formatage des montants avec 2 décimales
- [ ] Navigation "Voir tous" fonctionne
- [ ] Tab "Aperçu" se charge rapidement
- [ ] Responsive sur mobile/tablet/desktop
- [ ] Gestion d'erreurs correcte
- [ ] Patterns pausés gérés correctement
- [ ] Bouton Rafraîchir met à jour les données
- [ ] Pas d'erreurs console

---

## 📊 Résultat Attendu

Le dashboard offre maintenant une **vue d'ensemble rapide** des transactions récurrentes sans avoir à accéder à la page dédiée. C'est un raccourci pratique pour voir les prochaines transactions dues.

