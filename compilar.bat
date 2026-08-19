@echo off
setlocal
cd /d "%~dp0"
title ConteoLima - Compilar Produccion
chcp 65001 >nul

echo ==========================================================
echo           COMPILANDO APLICATIVO EN PRODUCCION
echo ==========================================================
echo.
cd /d "%~dp0frontend"
call npm run build
echo.
echo ==========================================================
echo   Compilacion terminada con exito. Archivos listos en:
echo   %~dp0frontend\dist
echo ==========================================================
echo.
pause
