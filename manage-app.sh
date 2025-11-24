#!/bin/bash

# Script de gestion de l'application Finances
# Usage: bash manage-app.sh [command]

COMMANDS=(
    "status     - Afficher le statut de l'application"
    "logs       - Afficher les logs en temps réel"
    "restart    - Redémarrer l'application"
    "stop       - Arrêter l'application"
    "start      - Démarrer l'application"
    "build      - Compiler le backend"
    "rebuild    - Compiler et redémarrer"
    "health     - Vérifier la santé de l'app"
    "reset      - Réinitialiser PM2 (expert)"
    "help       - Afficher cette aide"
)

show_menu() {
    echo ""
    echo "╔════════════════════════════════════════════╗"
    echo "║  Finances Application Manager              ║"
    echo "╚════════════════════════════════════════════╝"
    echo ""
    echo "Commandes disponibles:"
    printf '%s\n' "${COMMANDS[@]}"
    echo ""
}

show_status() {
    echo ""
    echo "📊 Statut de l'application:"
    echo ""
    pm2 status
    echo ""
    echo "📝 Informations détaillées:"
    pm2 show finances-backend 2>/dev/null || echo "Application non trouvée"
    echo ""
}

show_logs() {
    echo ""
    echo "📋 Logs en temps réel (Ctrl+C pour quitter):"
    echo ""
    pm2 logs finances-backend
}

show_errors() {
    echo ""
    echo "⚠️  Erreurs récentes:"
    echo ""
    pm2 logs finances-backend --err --lines 50
    echo ""
}

restart_app() {
    echo ""
    echo "🔄 Redémarrage de l'application..."
    pm2 restart finances-backend
    sleep 2
    pm2 status
    echo "✅ Application redémarrée"
    echo ""
}

stop_app() {
    echo ""
    echo "⏹️  Arrêt de l'application..."
    pm2 stop finances-backend
    sleep 1
    pm2 status
    echo "✅ Application arrêtée"
    echo ""
}

start_app() {
    echo ""
    echo "🚀 Démarrage de l'application..."
    pm2 start ecosystem.config.js
    sleep 2
    pm2 status
    echo "✅ Application démarrée"
    echo ""
}

build_backend() {
    echo ""
    echo "🔨 Compilation du backend..."
    cd backend
    npm run build
    cd ..
    echo "✅ Backend compilé"
    echo ""
}

rebuild_app() {
    build_backend
    restart_app
}

health_check() {
    echo ""
    echo "🏥 Vérification de santé..."
    echo ""

    # Vérifier PM2
    if ! command -v pm2 &> /dev/null; then
        echo "❌ PM2 non trouvé"
        return 1
    fi
    echo "✅ PM2 installé"

    # Vérifier l'app
    if ! pm2 status | grep -q "finances-backend"; then
        echo "❌ Application non trouvée dans PM2"
        return 1
    fi
    echo "✅ Application dans PM2"

    # Vérifier le port
    if netstat -tuln 2>/dev/null | grep -q ":3030"; then
        echo "✅ Port 3030 accessible"
    else
        echo "⚠️  Port 3030 non trouvé (app peut ne pas être démarrée)"
    fi

    # Vérifier la base de données
    if psql -U finances_user -d finances_db -h localhost -c "SELECT 1;" &>/dev/null; then
        echo "✅ Base de données accessible"
    else
        echo "❌ Base de données non accessible"
    fi

    # Vérifier Node.js
    echo "✅ Node.js version: $(node --version)"
    echo "✅ npm version: $(npm --version)"

    # Logs récents
    echo ""
    echo "📝 Dernières lignes de logs:"
    pm2 logs finances-backend --lines 10

    echo ""
}

reset_pm2() {
    echo ""
    echo "⚠️  RESET PM2 - Cette action va:"
    echo "   • Arrêter tous les processus"
    echo "   • Supprimer toutes les apps"
    echo "   • Réinitialiser PM2"
    echo ""
    read -p "Êtes-vous sûr? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Réinitialisation..."
        pm2 stop all
        pm2 delete all
        pm2 kill
        sleep 2
        echo "✅ PM2 réinitialisé"
        echo ""
        echo "Relancez: bash setup-autostart.sh"
    else
        echo "❌ Opération annulée"
    fi
    echo ""
}

# Traiter l'argument
case "${1:-help}" in
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    errors)
        show_errors
        ;;
    restart)
        restart_app
        ;;
    stop)
        stop_app
        ;;
    start)
        start_app
        ;;
    build)
        build_backend
        ;;
    rebuild)
        rebuild_app
        ;;
    health|health-check)
        health_check
        ;;
    reset)
        reset_pm2
        ;;
    help|-h|--help)
        show_menu
        ;;
    *)
        echo "❌ Commande inconnue: $1"
        show_menu
        exit 1
        ;;
esac
