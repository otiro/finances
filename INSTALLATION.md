# Guide d'Installation Rapide

Ce guide vous aidera à installer et démarrer l'application de gestion budgétaire sur votre machine locale ou votre Raspberry Pi.

## Installation Locale (Développement)

### 1. Prérequis

Assurez-vous d'avoir installé :
- Node.js 18+ ([https://nodejs.org](https://nodejs.org))
- PostgreSQL 14+ ([https://www.postgresql.org](https://www.postgresql.org))
- Git

### 2. Cloner le projet

```bash
git clone <votre-repo>
cd finances
```

### 3. Configuration PostgreSQL

Créez une base de données :

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données et l'utilisateur
CREATE DATABASE finances_db;
CREATE USER finances_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE finances_db TO finances_user;
\q
```

### 4. Configuration Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos paramètres
# Notamment DATABASE_URL et JWT_SECRET
nano .env  # ou votre éditeur préféré

# Générer le client Prisma
npm run prisma:generate

# Créer les tables de la base de données
npm run prisma:migrate

# (Optionnel) Voir la base de données avec Prisma Studio
npm run prisma:studio
```

### 5. Configuration Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Les valeurs par défaut devraient fonctionner pour le développement local
```

### 6. Démarrer l'application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Le backend démarrera sur `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Le frontend démarrera sur `http://localhost:5173`

### 7. Tester l'installation

Ouvrez votre navigateur et accédez à `http://localhost:5173`

Vous devriez voir la page d'accueil de l'application.

## Installation sur Raspberry Pi (Production)

### 1. Préparation du Raspberry Pi

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les outils nécessaires
sudo apt install -y curl git build-essential
```

### 2. Installer Node.js

```bash
# Installer Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

### 3. Installer PostgreSQL

```bash
# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE finances_db;
CREATE USER finances_user WITH ENCRYPTED PASSWORD 'mot_de_passe_sécurisé';
GRANT ALL PRIVILEGES ON DATABASE finances_db TO finances_user;
\q
```

### 4. Cloner et installer le projet

```bash
cd /home/pi
git clone <votre-repo> finances
cd finances

# Backend
cd backend
npm install
cp .env.example .env
nano .env  # Configurer avec les bons paramètres
npm run prisma:generate
npm run prisma:migrate
npm run build

# Frontend
cd ../frontend
npm install
cp .env.example .env
npm run build
```

### 5. Installer PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Démarrer le backend
cd /home/pi/finances/backend
pm2 start dist/index.js --name finances-api

# Démarrer le frontend avec serve
sudo npm install -g serve
cd /home/pi/finances/frontend
pm2 start "serve -s dist -l 5173" --name finances-frontend

# Sauvegarder la configuration PM2
pm2 save
pm2 startup
# Suivre les instructions affichées pour le démarrage automatique
```

### 6. Configurer Nginx (optionnel mais recommandé)

```bash
# Installer Nginx
sudo apt install -y nginx

# Créer la configuration
sudo nano /etc/nginx/sites-available/finances
```

Copier cette configuration :

```nginx
server {
    listen 80;
    server_name localhost;  # Ou votre nom de domaine

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/finances /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Configurer le pare-feu

```bash
sudo apt install -y ufw
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 8. Configuration SSL (optionnel mais recommandé)

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir un certificat (nécessite un nom de domaine)
sudo certbot --nginx -d votre-domaine.com
```

## Vérification de l'installation

### Vérifier les services

```bash
# Statut PM2
pm2 status

# Logs en temps réel
pm2 logs

# Monitoring
pm2 monit

# Statut Nginx
sudo systemctl status nginx

# Statut PostgreSQL
sudo systemctl status postgresql
```

### Test de connexion

1. Ouvrez un navigateur
2. Accédez à `http://ip-de-votre-raspberry` ou `http://localhost`
3. Vous devriez voir l'application

## Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs
cd backend
npm run dev
# Regarder les erreurs affichées

# Vérifier la connexion à la base de données
npm run prisma:studio
```

### Le frontend ne s'affiche pas

```bash
# Vérifier que le build a fonctionné
cd frontend
ls -la dist/

# Redémarrer le service
pm2 restart finances-frontend
pm2 logs finances-frontend
```

### Erreur de connexion à PostgreSQL

```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Tester la connexion
psql -U finances_user -d finances_db -h localhost
```

### Port déjà utilisé

```bash
# Trouver le processus qui utilise le port 3000
sudo lsof -i :3000

# Tuer le processus si nécessaire
kill -9 <PID>
```

## Prochaines étapes

Une fois l'installation terminée :

1. Créez votre premier compte utilisateur
2. Configurez votre foyer
3. Ajoutez vos comptes bancaires
4. Commencez à enregistrer vos transactions

Consultez le [README.md](README.md) pour plus d'informations sur l'utilisation de l'application.

## Mise à jour

```bash
cd /home/pi/finances
git pull

# Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run build
pm2 restart finances-api

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart finances-frontend
```

## Support

Pour toute question ou problème :
1. Consultez les logs avec `pm2 logs`
2. Vérifiez la configuration dans les fichiers `.env`
3. Consultez le [cahier des charges](CLAUDE.md) pour plus de détails
