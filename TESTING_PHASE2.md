# Guide de Test - Phase 2 : Authentification

## Préparation

### 1. Démarrer le backend
```bash
cd ~/finances/backend
npm run dev
```
Le backend devrait démarrer sur http://localhost:3030

### 2. Démarrer le frontend
Dans un nouveau terminal :
```bash
cd ~/finances/frontend
npm run dev
```
Le frontend devrait démarrer sur http://moneypi.local:5173

## Tests à effectuer

### Test 1 : Accès à la page d'accueil
1. Ouvrir http://moneypi.local:5173
2. **Résultat attendu** : Redirection automatique vers `/login`

### Test 2 : Inscription (Register)
1. Sur la page de login, cliquer sur "Pas encore de compte ? S'inscrire"
2. Remplir le formulaire :
   - Prénom : `Julien`
   - Nom : `Test`
   - Email : `julien.test@example.com`
   - Mot de passe : `password123`
   - Confirmer le mot de passe : `password123`
   - Revenu mensuel : `3500` (optionnel)
3. Cliquer sur "S'inscrire"
4. **Résultat attendu** :
   - Redirection automatique vers `/dashboard`
   - Affichage du message "Bienvenue, Julien Test !"
   - Affichage de l'email et du revenu mensuel

### Test 3 : Déconnexion (Logout)
1. Sur le dashboard, cliquer sur "Se déconnecter"
2. **Résultat attendu** :
   - Redirection vers `/login`
   - Le store Zustand est vidé (pas de token en localStorage)

### Test 4 : Connexion (Login)
1. Sur la page de login, entrer :
   - Email : `julien.test@example.com`
   - Mot de passe : `password123`
2. Cliquer sur "Se connecter"
3. **Résultat attendu** :
   - Redirection vers `/dashboard`
   - Affichage des informations de l'utilisateur

### Test 5 : Protection des routes
1. Se déconnecter
2. Essayer d'accéder directement à http://moneypi.local:5173/dashboard
3. **Résultat attendu** :
   - Redirection automatique vers `/login`
   - Impossible d'accéder au dashboard sans être authentifié

### Test 6 : Persistance de la session
1. Se connecter
2. Actualiser la page (F5)
3. **Résultat attendu** :
   - L'utilisateur reste connecté
   - Le dashboard s'affiche sans demander de se reconnecter
   - Les tokens sont persistés dans localStorage

### Test 7 : Validation des formulaires

#### Test 7a : Mot de passe trop court
1. Aller sur `/register`
2. Essayer de s'inscrire avec un mot de passe de moins de 8 caractères
3. **Résultat attendu** : Message d'erreur "Le mot de passe doit contenir au moins 8 caractères"

#### Test 7b : Mots de passe non identiques
1. Aller sur `/register`
2. Entrer deux mots de passe différents
3. **Résultat attendu** : Message d'erreur "Les mots de passe ne correspondent pas"

#### Test 7c : Email invalide
1. Essayer de s'inscrire avec un email invalide (ex: "test")
2. **Résultat attendu** : Validation HTML5 empêche la soumission

### Test 8 : Gestion des erreurs backend

#### Test 8a : Email déjà existant
1. Essayer de s'inscrire avec l'email `julien.test@example.com` (déjà utilisé)
2. **Résultat attendu** : Message d'erreur du backend affiché dans une alerte rouge

#### Test 8b : Identifiants incorrects
1. Essayer de se connecter avec un mauvais mot de passe
2. **Résultat attendu** : Message d'erreur "Erreur de connexion" affiché

## Vérifications en base de données

Après l'inscription, vérifier que l'utilisateur est bien créé :

```bash
sudo -u postgres psql -d finances_db
```

```sql
-- Voir tous les utilisateurs
SELECT id, email, "firstName", "lastName", "monthlyIncome", "createdAt"
FROM "User";

-- Vérifier que le mot de passe est bien hashé
SELECT id, email, "passwordHash"
FROM "User"
WHERE email = 'julien.test@example.com';
```

Le `passwordHash` devrait être un hash bcrypt commençant par `$2b$10$...`

## Vérifications dans le navigateur

### LocalStorage
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet "Application" > "Local Storage" > `http://moneypi.local:5173`
3. Chercher la clé `auth-storage`
4. **Résultat attendu** : Un objet JSON contenant :
   ```json
   {
     "state": {
       "user": { ... },
       "accessToken": "eyJhbGc...",
       "refreshToken": "eyJhbGc...",
       "isAuthenticated": true
     }
   }
   ```

### Network
1. Dans les DevTools, aller dans l'onglet "Network"
2. Se connecter
3. Vérifier que la requête POST vers `/api/auth/login` :
   - Status : 200
   - Response contient `user` et `tokens`

## Troubleshooting

### Erreur CORS
Si vous voyez une erreur CORS dans la console :
- Vérifier que le backend est bien démarré sur le port 3030
- Vérifier le fichier `.env` du backend : `CORS_ORIGIN=http://moneypi.local:5173`

### Port 3030 déjà utilisé
```bash
# Trouver le processus
lsof -ti:3030

# Le tuer
lsof -ti:3030 | xargs kill -9
```

### Frontend bloqué par "Host not allowed"
Vérifier que `vite.config.ts` contient bien :
```typescript
server: {
  host: '0.0.0.0',
  allowedHosts: ['moneypi.local', 'localhost', '.local'],
}
```

## Résultat attendu final

Une fois tous les tests passés :
- ✅ Inscription fonctionnelle avec validation
- ✅ Connexion fonctionnelle avec gestion d'erreurs
- ✅ Déconnexion fonctionnelle
- ✅ Routes protégées fonctionnelles
- ✅ Persistance de session fonctionnelle
- ✅ Tokens JWT stockés et utilisés correctement
- ✅ Mot de passe hashé avec bcrypt en base de données

**🎉 Phase 2 terminée avec succès !**

## Prochaine étape

Une fois tous ces tests validés, nous pourrons passer à la **Phase 3 : Gestion des comptes et foyers**.
