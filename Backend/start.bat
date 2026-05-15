@echo off
title EVADIA - Demarrage des services
color 0A

echo ============================================
echo        EVADIA - Demarrage des services
echo ============================================
echo.

:: Verifier que PHP est disponible
where php >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] PHP n'est pas installe ou pas dans le PATH.
    pause
    exit /b 1
)

:: Verifier que Node est disponible
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe ou pas dans le PATH.
    pause
    exit /b 1
)

:: Verifier que les dependances sont installees
if not exist "vendor" (
    echo [INFO] Installation des dependances PHP...
    call composer install
)
if not exist "node_modules" (
    echo [INFO] Installation des dependances JS...
    call npm install
)

:: Verifier le fichier .env
if not exist ".env" (
    echo [INFO] Creation du fichier .env...
    copy .env.example .env
    php artisan key:generate
)

:: Compiler les assets si pas de build
if not exist "public\build\manifest.json" (
    echo [INFO] Compilation des assets...
    call npm run build
)

echo.
:: Demarrage de Redis
set "REDIS_PATH=D:\Telechargements\Redis-8.6.3-Windows-x64-cygwin\Redis-8.6.3-Windows-x64-cygwin\redis-server.exe"
if exist "%REDIS_PATH%" (
    echo [1/5] Demarrage de Redis...
    start "EVADIA - Redis" cmd /k ""%REDIS_PATH%""
) else (
    echo [1/5] Redis non trouve a %REDIS_PATH% - ignore
)

echo [2/5] Demarrage du serveur Laravel (port 8000)...
start "EVADIA - Laravel" cmd /k "cd /d %~dp0 && php artisan serve"

echo [3/5] Demarrage de Vite (hot-reload)...
start "EVADIA - Vite" cmd /k "cd /d %~dp0 && npm run dev"

echo [4/5] Demarrage de Reverb WebSocket (port 6001)...
start "EVADIA - Reverb" cmd /k "cd /d %~dp0 && php artisan reverb:start"

echo [5/5] Demarrage du Queue Worker...
start "EVADIA - Queue" cmd /k "cd /d %~dp0 && php artisan queue:work"

echo.
echo ============================================
echo   Tous les services sont demarres !
echo.
echo   Application : http://localhost:8000
echo   Vite HMR    : http://localhost:5173
echo ============================================
echo.
echo Fermez cette fenetre pour continuer.
echo Pour arreter les services, fermez chaque fenetre individuellement.
pause
