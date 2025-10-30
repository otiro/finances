#!/bin/bash

# Script d'installation et de configuration du projet Finances Familiales
# Usage: ./setup.sh

set -e

echo "=========================================="
echo "  Installation - Finances Familiales"
echo "=========================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher un message de succès
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Fonction pour afficher un message d'avertissement
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Fonction pour afficher un message d'erreur
error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérifier Node.js
echo "Vérification des prérequis..."
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org"
    exit 1
fi
success "Node.js $(node --version) détecté"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
    exit 1
fi
success "npm $(npm --version) détecté"

# Vérifier PostgreSQL
if ! command -v psql &> /dev/null; then
    warning "PostgreSQL n'est pas détecté. Assurez-vous qu'il est installé."
else
    success "PostgreSQL détecté"
fi

echo ""
echo "=========================================="
echo "  Installation des dépendances Backend"
echo "=========================================="
echo ""

cd backend

if [ -f "package.json" ]; then
    npm install
    success "Dépendances backend installées"
else
    error "package.json introuvable dans backend/"
    exit 1
fi

# Copier .env si nécessaire
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        warning "Fichier .env créé depuis .env.example"
        warning "⚠️ IMPORTANT: Éditez backend/.env avec vos paramètres (DATABASE_URL, JWT_SECRET, etc.)"
    else
        error ".env.example introuvable"
    fi
else
    success "Fichier .env existe déjà"
fi

cd ..

echo ""
echo "=========================================="
echo "  Installation des dépendances Frontend"
echo "=========================================="
echo ""

cd frontend

if [ -f "package.json" ]; then
    npm install
    success "Dépendances frontend installées"
else
    error "package.json introuvable dans frontend/"
    exit 1
fi

# Copier .env si nécessaire
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        success "Fichier .env créé depuis .env.example"
    else
        warning ".env.example introuvable"
    fi
else
    success "Fichier .env existe déjà"
fi

cd ..

echo ""
echo "=========================================="
echo "  Configuration terminée !"
echo "=========================================="
echo ""
echo "Prochaines étapes :"
echo ""
echo "1. Configurer PostgreSQL :"
echo "   psql -U postgres"
echo "   CREATE DATABASE finances_db;"
echo "   CREATE USER finances_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe';"
echo "   GRANT ALL PRIVILEGES ON DATABASE finances_db TO finances_user;"
echo ""
echo "2. Éditer backend/.env avec vos paramètres"
echo ""
echo "3. Générer le client Prisma et créer les tables :"
echo "   cd backend"
echo "   npm run prisma:generate"
echo "   npm run prisma:migrate"
echo ""
echo "4. Démarrer l'application :"
echo "   Terminal 1 : cd backend && npm run dev"
echo "   Terminal 2 : cd frontend && npm run dev"
echo ""
echo "5. Accéder à l'application :"
echo "   Frontend : http://localhost:5173"
echo "   Backend  : http://localhost:3000"
echo ""
success "Installation terminée avec succès !"
