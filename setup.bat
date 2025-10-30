@echo off
REM Script d'installation pour Windows
REM Usage: setup.bat

echo ==========================================
echo   Installation - Finances Familiales
echo ==========================================
echo.

REM Vérifier Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installé
    echo Téléchargez-le depuis https://nodejs.org
    exit /b 1
)
echo [OK] Node.js detecté :
node --version

REM Vérifier npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] npm n'est pas installé
    exit /b 1
)
echo [OK] npm detecté :
npm --version

echo.
echo ==========================================
echo   Installation Backend
echo ==========================================
echo.

cd backend

if not exist package.json (
    echo [ERREUR] package.json introuvable dans backend/
    exit /b 1
)

call npm install
if %errorlevel% neq 0 (
    echo [ERREUR] Installation des dépendances backend échouée
    exit /b 1
)
echo [OK] Dépendances backend installées

REM Copier .env si nécessaire
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo [OK] Fichier .env créé
        echo [ATTENTION] Éditez backend\.env avec vos paramètres
    )
) else (
    echo [OK] Fichier .env existe déjà
)

cd ..

echo.
echo ==========================================
echo   Installation Frontend
echo ==========================================
echo.

cd frontend

if not exist package.json (
    echo [ERREUR] package.json introuvable dans frontend/
    exit /b 1
)

call npm install
if %errorlevel% neq 0 (
    echo [ERREUR] Installation des dépendances frontend échouée
    exit /b 1
)
echo [OK] Dépendances frontend installées

REM Copier .env si nécessaire
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo [OK] Fichier .env créé
    )
) else (
    echo [OK] Fichier .env existe déjà
)

cd ..

echo.
echo ==========================================
echo   Configuration terminée !
echo ==========================================
echo.
echo Prochaines étapes :
echo.
echo 1. Installer PostgreSQL si ce n'est pas fait
echo    https://www.postgresql.org/download/windows/
echo.
echo 2. Créer la base de données :
echo    psql -U postgres
echo    CREATE DATABASE finances_db;
echo    CREATE USER finances_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe';
echo    GRANT ALL PRIVILEGES ON DATABASE finances_db TO finances_user;
echo.
echo 3. Éditer backend\.env avec vos paramètres
echo.
echo 4. Générer Prisma et créer les tables :
echo    cd backend
echo    npm run prisma:generate
echo    npm run prisma:migrate
echo.
echo 5. Démarrer l'application :
echo    Terminal 1 : cd backend ^&^& npm run dev
echo    Terminal 2 : cd frontend ^&^& npm run dev
echo.
echo 6. Accéder à l'application :
echo    Frontend : http://localhost:5173
echo    Backend  : http://localhost:3000
echo.
echo [OK] Installation terminée avec succès !
echo.
pause
