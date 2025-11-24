#!/bin/bash

# Script d'automatisation du démarrage de l'application Finances
# À exécuter sur le Raspberry Pi: bash setup-autostart.sh

set -e  # Exit si une commande échoue

echo "================================================"
echo "  Setup Autostart - Finances Application"
echo "================================================"
echo ""

# Vérifier que nous sommes sur un Raspberry Pi ou Linux
if [[ ! "$OSTYPE" == "linux-gnu"* ]]; then
    echo "❌ Ce script doit être exécuté sur Linux (Raspberry Pi)"
    exit 1
fi

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Ce script doit être exécuté depuis le répertoire racine de finances (~/finances)"
    exit 1
fi

echo "📁 Répertoire: $(pwd)"
echo ""

# Étape 1: Installer PM2 globalement
echo "📦 Étape 1: Installation PM2..."
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 est déjà installé: $(pm2 --version)"
else
    echo "Installation de PM2..."
    sudo npm install -g pm2
    echo "✅ PM2 installé"
fi
echo ""

# Étape 2: Créer le répertoire logs
echo "📂 Étape 2: Création répertoire logs..."
if [ ! -d "logs" ]; then
    mkdir -p logs
    echo "✅ Répertoire logs créé"
else
    echo "✅ Répertoire logs existe déjà"
fi
echo ""

# Étape 3: Construire le backend
echo "🔨 Étape 3: Compilation du backend..."
cd backend
if [ -f "dist/index.js" ]; then
    echo "⏭️  Backend déjà compilé (dist/ existe)"
else
    echo "Compilation en cours..."
    npm run build
    echo "✅ Backend compilé"
fi
cd ..
echo ""

# Étape 4: Vérifier que .env existe
echo "🔐 Étape 4: Vérification configuration..."
if [ -f "backend/.env" ]; then
    echo "✅ Fichier backend/.env trouvé"
else
    echo "❌ Fichier backend/.env non trouvé"
    echo "   Créez-le en copiant backend/.env.example et en remplissant les variables"
    exit 1
fi
echo ""

# Étape 5: Créer ecosystem.config.js s'il n'existe pas
echo "⚙️  Étape 5: Configuration PM2..."
if [ ! -f "ecosystem.config.js" ]; then
    echo "Création de ecosystem.config.js..."
    cat > ecosystem.config.js << 'EOFCONFIG'
module.exports = {
  apps: [
    {
      name: 'finances-backend',
      script: 'npm',
      args: 'start',
      cwd: '/home/julien/finances/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/home/julien/finances/logs/backend-error.log',
      out_file: '/home/julien/finances/logs/backend-out.log',
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
EOFCONFIG
    echo "✅ ecosystem.config.js créé"
else
    echo "✅ ecosystem.config.js existe déjà"
fi
echo ""

# Étape 6: Arrêter les processus existants
echo "⏹️  Étape 6: Arrêt des processus existants..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sleep 1
echo "✅ Processus arrêtés"
echo ""

# Étape 7: Démarrer avec PM2
echo "🚀 Étape 7: Démarrage de l'application..."
pm2 start ecosystem.config.js
sleep 2
pm2 status
echo "✅ Application démarrée"
echo ""

# Étape 8: Configurer le autostart
echo "🔄 Étape 8: Configuration du autostart au boot..."
pm2 startup systemd -u julien --hp /home/julien
pm2 save
echo "✅ Autostart configuré"
echo ""

# Vérification finale
echo "================================================"
echo "  ✅ SETUP COMPLÈTE"
echo "================================================"
echo ""
echo "📋 Vérifications:"
pm2 status
echo ""
echo "📝 Logs:"
pm2 logs --lines 5
echo ""
echo "🎯 Commandes utiles:"
echo "  • Voir le statut:        pm2 status"
echo "  • Voir les logs:         pm2 logs"
echo "  • Redémarrer l'app:      pm2 restart finances-backend"
echo "  • Arrêter l'app:         pm2 stop finances-backend"
echo "  • Démarrer l'app:        pm2 start ecosystem.config.js"
echo ""
echo "🌐 Accéder à l'application:"
echo "  • Backend API:  http://moneypi.local:3030"
echo "  • Frontend:     http://moneypi.local"
echo ""
echo "📚 Documentation: AUTOSTART_GUIDE.md"
echo ""
