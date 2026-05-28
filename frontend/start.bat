@echo off
title Evadia - Front OFFICE
color 0A

echo ========================================
echo      E V A D I A - Front OFFICE
echo ========================================
echo.

:: Vérifier si Node.js est installé
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

:: Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo [INFO] Installation des dependances...
    call npm install
    echo.
)

:: Vérifier si tsx est installé pour les scripts
call npm list tsx >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Installation de tsx...
    call npm install -D tsx
    echo.
)

:: Créer le dossier messages s'il n'existe pas
if not exist "messages" (
    mkdir messages
    echo [INFO] Dossier messages cree
)

:: Vérifier si fr.json existe, sinon le créer
if not exist "messages\fr.json" (
    echo { "HomePage": { "title": "Bienvenue" }, "Bouton": { "login": "Se connecter", "register": "S'inscrire" } } > messages\fr.json
    echo [INFO] Fichier fr.json cree par defaut
)

:: Vérifier si .env.local existe
if not exist ".env.local" (
    echo DEFAULT_LOCALE=fr > .env.local
    echo [INFO] Fichier .env.local cree
)

echo.
echo ========================================
echo      Lancement de l'application
echo ========================================
echo.

:: Ouvrir un nouveau terminal pour la traduction
start "Traduction Auto" cmd /c "npm run translate:watch"

:: Attendre 2 secondes pour que le script de traduction se lance
timeout /t 2 /nobreak >nul

:: Récupérer l'IP locale
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"Adresse IPv4"') do (
    set "LOCAL_IP=%%a"
    goto :found_ip
)
:found_ip
set "LOCAL_IP=%LOCAL_IP: =%"

:: Lancer Next.js
echo [INFO] Demarrage du serveur Next.js...
echo [INFO] Acceder localement    : http://localhost:3000
echo [INFO] Acceder sur le reseau : http://%LOCAL_IP%:3000
echo.
echo [INFO] Appuyez sur Ctrl+C pour arreter l'application
echo.

npx next dev -H 0.0.0.0

:: Quand on ferme le terminal principal, fermer aussi le terminal de traduction
taskkill /FI "WINDOWTITLE eq Traduction Auto" /T >nul 2>nul

pause