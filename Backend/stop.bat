@echo off
title EVADIA - Arret des services
color 0C

echo ============================================
echo        EVADIA - Arret des services
echo ============================================
echo.

:: Arreter les processus PHP (artisan serve, reverb, queue)
taskkill /FI "WINDOWTITLE eq EVADIA - Laravel*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq EVADIA - Reverb*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq EVADIA - Queue*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq EVADIA - Vite*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq EVADIA - Redis*" /F >nul 2>nul

echo [OK] Tous les services EVADIA ont ete arretes.
echo.
pause
