# 🎯 Prochaines Étapes Immédiatement

Vous venez d'installer les dépendances. Voici **exactement** ce qu'il faut faire maintenant pour démarrer le projet.

## ✅ Ce qui est déjà fait

- ✅ Dépendances backend installées (`npm install`)
- ✅ Structure du projet créée
- ✅ Fichier `.env` créé dans `backend/`

## 🔧 Ce qu'il faut faire MAINTENANT (dans l'ordre)

### 1. Configurer PostgreSQL (5 minutes)

```bash
# Vérifier que PostgreSQL est installé et démarré
sudo systemctl status postgresql

# Si pas installé :
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Créer la base de données
sudo -u postgres psql
```

Dans PostgreSQL (après `sudo -u postgres psql`), copiez-collez :

```sql
CREATE DATABASE finances_db;
CREATE USER finances_user WITH ENCRYPTED PASSWORD 'VotreMotDePasseSecurise123!';
GRANT ALL PRIVILEGES ON DATABASE finances_db TO finances_user;
\c finances_db
GRANT ALL ON SCHEMA public TO finances_user;
\q
```

**Note :** Remplacez `VotreMotDePasseSecurise123!` par un vrai mot de passe fort et **notez-le quelque part** !

### 2. Éditer le fichier .env (3 minutes)

```bash
cd ~/finances/backend
nano .env
```

**Modifiez ces 3 lignes OBLIGATOIREMENT :**

#### a. DATABASE_URL
Remplacez `votre_mot_de_passe_securise` par le mot de passe que vous venez de créer :

```env
DATABASE_URL="postgresql://finances_user:VotreMotDePasseSecurise123!@localhost:5432/finances_db?schema=public"
```

#### b. JWT_SECRET
Générez une clé secrète :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez le résultat et remplacez dans `.env` :

```env
JWT_SECRET=collez_ici_la_cle_generee_128_caracteres
```

#### c. JWT_REFRESH_SECRET
Générez une AUTRE clé secrète :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez le résultat dans `.env` :

```env
JWT_REFRESH_SECRET=collez_ici_la_deuxieme_cle_generee_differente
```

#### d. CORS_ORIGIN (optionnel)

Si vous accédez depuis un autre PC sur votre réseau :
```env
CORS_ORIGIN=http://moneypi.local:5173
```

Si vous testez directement sur le Raspberry Pi :
```env
CORS_ORIGIN=http://localhost:5173
```

**Sauvegardez** avec `Ctrl+O`, `Entrée`, puis `Ctrl+X`.

### 3. Initialiser Prisma et créer les tables (2 minutes)

```bash
cd ~/finances/backend

# Générer le client Prisma
npm run prisma:generate

# Créer les tables dans la base de données
npm run prisma:migrate
```

Quand demandé `Enter a name for the new migration:`, tapez : `init`

Vous devriez voir :
```
✔ Enter a name for the new migration: › init
...
Your database is now in sync with your schema.
✔ Generated Prisma Client
```

### 4. Démarrer le backend (30 secondes)

```bash
npm run dev
```

✅ **Si vous voyez ça, c'est bon :**
```
[INFO] Server is running on port 3030
[INFO] Environment: development
[INFO] Database connected successfully
```

🎉 **Le backend fonctionne !**

Gardez ce terminal ouvert. Ouvrez un **nouveau terminal** pour la suite.

### 5. Configurer et démarrer le frontend (3 minutes)

Dans un **NOUVEAU terminal** :

```bash
cd ~/finances/frontend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Éditer si besoin (optionnel)
nano .env
```

Le contenu par défaut devrait fonctionner :
```env
VITE_API_URL=http://localhost:3030/api
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Finances Familiales
VITE_APP_VERSION=1.0.0
```

Si vous accédez depuis un autre PC, changez `localhost` par `moneypi.local` ou l'IP du Pi.

**Démarrer le frontend :**

```bash
npm run dev
```

✅ **Si vous voyez ça, c'est bon :**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

🎉 **Le frontend fonctionne !**

### 6. Tester l'application (1 minute)

Ouvrez un navigateur :

**Sur le Raspberry Pi :**
```
http://localhost:5173
```

**Depuis un autre PC sur le réseau :**
```
http://moneypi.local:5173
```

Vous devriez voir la page "Finances Familiales - Application en cours de développement..."

## ✅ Vérification Complète

### Tester le Backend

Dans un nouveau terminal :

```bash
curl http://localhost:3030/health
```

Réponse attendue :
```json
{"status":"ok","timestamp":"2024-10-30..."}
```

### Voir la base de données (optionnel mais utile)

```bash
cd ~/finances/backend
npm run prisma:studio
```

Ouvrez dans un navigateur : `http://localhost:5555`

Vous verrez une interface graphique avec toutes vos tables vides (normal, vous n'avez pas encore de données).

## 🎯 Résumé des Commandes

Vous aurez besoin de **2 terminaux** (ou utilisez `tmux`/`screen`) :

**Terminal 1 - Backend :**
```bash
cd ~/finances/backend
npm run dev
```

**Terminal 2 - Frontend :**
```bash
cd ~/finances/frontend
npm run dev
```

## 📊 Ports Utilisés

- **Backend API :** http://localhost:3030
- **Frontend :** http://localhost:5173
- **Prisma Studio :** http://localhost:5555 (quand lancé)
- **PostgreSQL :** localhost:5432

## 🐛 Problèmes Courants

### "Cannot connect to database"

1. Vérifiez PostgreSQL :
   ```bash
   sudo systemctl status postgresql
   ```

2. Vérifiez le mot de passe dans `backend/.env`

3. Testez manuellement :
   ```bash
   psql -U finances_user -d finances_db -h localhost
   ```

### "Port 3030 already in use"

Tuez le processus :
```bash
lsof -ti:3030 | xargs kill -9
```

### Prisma generate échoue

```bash
cd ~/finances/backend
rm -rf node_modules
npm install
npm run prisma:generate
```

### ESLint errors

C'est normal, ESLint a été mis à jour. Les warnings peuvent être ignorés pour l'instant. Le code fonctionne.

## 🚀 Prochaine Phase : Développement

Une fois que tout fonctionne (backend + frontend + base de données), vous êtes prêt pour :

**Phase 2 : Authentification**
- Implémenter le système de login/register
- Créer les formulaires frontend
- Tester la connexion utilisateur

Consultez [PROJECT_STATUS.md](PROJECT_STATUS.md) section "Phase 2" pour les détails.

## 📚 Documentation Utile

- **Configuration détaillée :** [CONFIGURATION_RASPBERRY_PI.md](CONFIGURATION_RASPBERRY_PI.md)
- **Démarrage rapide :** [QUICKSTART.md](QUICKSTART.md)
- **Architecture :** [STRUCTURE.md](STRUCTURE.md)
- **État du projet :** [PROJECT_STATUS.md](PROJECT_STATUS.md)

## ✅ Checklist Finale

Avant de passer au développement, vérifiez que :

- [ ] PostgreSQL est installé et démarré
- [ ] Base de données `finances_db` créée
- [ ] Utilisateur `finances_user` créé
- [ ] Fichier `backend/.env` configuré avec le bon mot de passe
- [ ] JWT secrets générés et configurés
- [ ] `npm run prisma:generate` exécuté sans erreur
- [ ] `npm run prisma:migrate` exécuté sans erreur
- [ ] Backend démarre avec `npm run dev` (port 3030)
- [ ] Frontend démarre avec `npm run dev` (port 5173)
- [ ] `curl http://localhost:3030/health` retourne `{"status":"ok"}`
- [ ] Page frontend accessible dans le navigateur

Si tous les points sont cochés : **🎉 Bravo ! Vous êtes prêt à développer !**

---

**Configuration :** Raspberry Pi "moneypi" | Utilisateur : julien
**Statut :** ✅ Phase 1 terminée - Prêt pour Phase 2
