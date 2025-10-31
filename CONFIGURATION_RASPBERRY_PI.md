# Configuration Raspberry Pi - Guide Complet

Ce guide est spécifique à votre configuration sur le Raspberry Pi "moneypi" avec l'utilisateur "julien".

## 📋 Prérequis

Vous avez déjà :
- ✅ Raspberry Pi configuré (hostname: moneypi)
- ✅ Node.js installé
- ✅ npm installé
- ✅ Dépendances backend installées (`npm install`)

## 🔧 Configuration Étape par Étape

### 1. Configuration PostgreSQL

#### a. Vérifier que PostgreSQL est installé et démarré

```bash
sudo systemctl status postgresql
```

Si PostgreSQL n'est pas installé :
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### b. Créer la base de données et l'utilisateur

```bash
# Se connecter à PostgreSQL en tant que superutilisateur
sudo -u postgres psql
```

Dans le shell PostgreSQL, exécutez :

```sql
-- Créer la base de données
CREATE DATABASE finances_db;

-- Créer l'utilisateur avec un mot de passe sécurisé
-- REMPLACEZ 'VotreMotDePasseSecurise123!' par un vrai mot de passe fort
CREATE USER finances_user WITH ENCRYPTED PASSWORD 'VotreMotDePasseSecurise123!';

-- Donner tous les privilèges sur la base de données
GRANT ALL PRIVILEGES ON DATABASE finances_db TO finances_user;

-- Sur PostgreSQL 15+, vous devez aussi faire ceci :
\c finances_db
GRANT ALL ON SCHEMA public TO finances_user;

-- Vérifier que tout est créé
\l
\du

-- Quitter
\q
```

#### c. Tester la connexion

```bash
psql -U finances_user -d finances_db -h localhost
# Entrez votre mot de passe quand demandé
# Si ça fonctionne, tapez \q pour quitter
```

### 2. Configuration du fichier .env

Le fichier `.env` a déjà été créé dans `backend/.env`. Vous devez maintenant le personnaliser.

```bash
cd ~/finances/backend
nano .env
```

#### Paramètres à modifier OBLIGATOIREMENT :

**1. DATABASE_URL**
Remplacez `votre_mot_de_passe_securise` par le mot de passe que vous avez choisi lors de la création de l'utilisateur PostgreSQL :

```env
DATABASE_URL="postgresql://finances_user:VotreMotDePasseSecurise123!@localhost:5432/finances_db?schema=public"
```

**2. JWT_SECRET et JWT_REFRESH_SECRET**

Générez deux clés secrètes différentes avec cette commande :

```bash
# Première clé pour JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Deuxième clé pour JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez les résultats dans votre `.env` :

```env
JWT_SECRET=la_premiere_cle_generee_ici_128_caracteres
JWT_REFRESH_SECRET=la_deuxieme_cle_generee_ici_128_caracteres_differente
```

**3. CORS_ORIGIN**

Si vous accédez au Raspberry Pi depuis un autre ordinateur sur votre réseau local :

```env
# Remplacez par l'IP de votre Raspberry Pi ou son hostname
CORS_ORIGIN=http://moneypi.local:5173
# OU
CORS_ORIGIN=http://192.168.1.XXX:5173
```

Si vous testez directement sur le Raspberry Pi (navigateur sur le Pi) :

```env
CORS_ORIGIN=http://localhost:5173
```

#### Fichier .env complet exemple :

```env
# Database
DATABASE_URL="postgresql://finances_user:MonMotDePasse123Securise!@localhost:5432/finances_db?schema=public"

# Server
PORT=3000
NODE_ENV=development

# JWT - Clés générées aléatoirement
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4321098765432109876543210987654321098765432109876543210987654321098765432
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://moneypi.local:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 3. Initialiser Prisma et la Base de Données

```bash
cd ~/finances/backend

# Générer le client Prisma
npm run prisma:generate

# Créer les tables dans la base de données
npm run prisma:migrate

# Quand demandé, entrez un nom pour la migration, par exemple: "init"
```

Vous devriez voir :
```
✔ Enter a name for the new migration: › init
...
Your database is now in sync with your schema.
```

### 4. Vérifier que tout fonctionne

#### a. Démarrer Prisma Studio (optionnel mais utile)

```bash
npm run prisma:studio
```

Cela ouvre une interface web sur `http://localhost:5555` où vous pouvez voir votre base de données.

#### b. Démarrer le serveur backend

```bash
npm run dev
```

Vous devriez voir :
```
[INFO] Server is running on port 3000
[INFO] Environment: development
[INFO] Database connected successfully
```

Si vous voyez ces messages, **tout fonctionne !** ✅

### 5. Configuration du Frontend

```bash
cd ~/finances/frontend

# Le fichier .env.example existe déjà, copions-le
cp .env.example .env

# Éditez-le
nano .env
```

Contenu du fichier `.env` frontend :

```env
# API Configuration
VITE_API_URL=http://moneypi.local:3000/api
VITE_API_TIMEOUT=30000

# Application
VITE_APP_NAME=Finances Familiales
VITE_APP_VERSION=1.0.0
```

**Note importante :** Si vous accédez au frontend depuis un autre ordinateur, remplacez `moneypi.local` par l'adresse IP de votre Raspberry Pi.

### 6. Installer les dépendances frontend et démarrer

```bash
cd ~/finances/frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://moneypi.local:5173` (ou `http://localhost:5173` si vous êtes directement sur le Pi).

## 🚀 Démarrage Complet du Projet

Vous aurez besoin de **deux terminaux** (ou utilisez `tmux`/`screen`) :

### Terminal 1 - Backend

```bash
cd ~/finances/backend
npm run dev
```

### Terminal 2 - Frontend

```bash
cd ~/finances/frontend
npm run dev
```

## 🔍 Vérification de l'Installation

### 1. Tester le Backend

```bash
curl http://localhost:3000/health
```

Réponse attendue :
```json
{"status":"ok","timestamp":"2024-..."}
```

### 2. Tester le Frontend

Ouvrez un navigateur et accédez à :
- Directement sur le Pi : `http://localhost:5173`
- Depuis un autre PC : `http://moneypi.local:5173` ou `http://IP_DU_PI:5173`

### 3. Vérifier la base de données

```bash
cd ~/finances/backend
npm run prisma:studio
```

Accédez à `http://localhost:5555` pour voir l'interface Prisma Studio.

## 🛠️ Trouver l'IP de votre Raspberry Pi

Si `moneypi.local` ne fonctionne pas, trouvez l'IP :

```bash
hostname -I
# OU
ip addr show
```

Utilisez la première adresse IP (généralement 192.168.X.X).

## 🔒 Sécurité - Configuration du Firewall

```bash
# Installer UFW si pas déjà fait
sudo apt install ufw -y

# Autoriser SSH (IMPORTANT !)
sudo ufw allow 22/tcp

# Autoriser les ports du projet
sudo ufw allow 3000/tcp   # Backend
sudo ufw allow 5173/tcp   # Frontend (développement)

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

## 📊 Monitoring et Logs

### Voir les logs en temps réel

Les logs du backend s'affichent directement dans le terminal où vous avez lancé `npm run dev`.

### Logs PostgreSQL

```bash
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 🐛 Dépannage

### Erreur: "Cannot connect to database"

1. Vérifiez que PostgreSQL est démarré :
   ```bash
   sudo systemctl status postgresql
   ```

2. Vérifiez le mot de passe dans `.env`

3. Testez la connexion manuellement :
   ```bash
   psql -U finances_user -d finances_db -h localhost
   ```

### Erreur: "Port 3000 already in use"

Trouvez et tuez le processus :
```bash
lsof -ti:3000 | xargs kill -9
# OU changez le PORT dans .env
```

### Erreur: "CORS policy"

Vérifiez que `CORS_ORIGIN` dans `backend/.env` correspond à l'URL d'où vous accédez au frontend.

### Prisma generate échoue

```bash
cd ~/finances/backend
rm -rf node_modules
npm install
npm run prisma:generate
```

## 📝 Commandes Utiles

### Redémarrer PostgreSQL
```bash
sudo systemctl restart postgresql
```

### Voir les bases de données PostgreSQL
```bash
sudo -u postgres psql -c "\l"
```

### Sauvegarder la base de données
```bash
pg_dump -U finances_user finances_db > ~/backup_finances_$(date +%Y%m%d).sql
```

### Restaurer une sauvegarde
```bash
psql -U finances_user finances_db < ~/backup_finances_YYYYMMDD.sql
```

## 🎯 Prochaines Étapes

Une fois que tout fonctionne :

1. ✅ Backend démarre sans erreur
2. ✅ Frontend accessible dans le navigateur
3. ✅ Prisma Studio fonctionne
4. ✅ Connexion à la base de données OK

Vous êtes prêt à commencer le développement de la **Phase 2 : Authentification** !

Consultez [PROJECT_STATUS.md](PROJECT_STATUS.md) pour voir les prochaines tâches à implémenter.

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans le terminal
2. Vérifiez que PostgreSQL est démarré
3. Vérifiez les paramètres du fichier `.env`
4. Testez la connexion à la base de données manuellement

---

**Configuration pour :** Raspberry Pi "moneypi" | Utilisateur : julien
**Date de création :** $(date)
