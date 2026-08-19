@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title ConteoLima - Compartir en Linea
chcp 65001 >nul

echo ====================================================
echo        CONTEOLIMA - COMPARTIR PAGINA EN LINEA
echo ====================================================
echo.

echo [1/2] Iniciando servidores locales (3000 y 3180)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3180" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

powershell -NoProfile -Command "Start-Process -FilePath 'node' -ArgumentList 'src/server.js' -WorkingDirectory '%~dp0backend' -WindowStyle Hidden"
powershell -NoProfile -Command "Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory '%~dp0frontend' -WindowStyle Hidden"

echo Servidores locales iniciados en puertos 3000 (API) y 3180 (Web).
echo.
echo [2/2] Generando enlace publico con Cloudflare Tunnel...
echo.
echo ====================================================
echo INSTRUCCIONES:
echo.
echo 1. Copia el enlace HTTPS que aparece abajo.
echo    Formato: https://xxxx.trycloudflare.com
echo.
echo 2. Pasale ese enlace a cualquier persona.
echo    Podran abrirlo en su PC o Celular (4G/5G/Wi-Fi).
echo.
echo 3. El enlace se mantendra ACTIVO hasta que cierres
echo    esta ventana o apagues tu equipo.
echo ====================================================
echo.

if exist "%~dp0cloudflared.exe" (
    "%~dp0cloudflared.exe" tunnel --url http://localhost:3180
) else if exist "%~dp0scripts\cloudflared.exe" (
    "%~dp0scripts\cloudflared.exe" tunnel --url http://localhost:3180
) else (
    npx --yes cloudflared tunnel --url http://localhost:3180
)

pause
