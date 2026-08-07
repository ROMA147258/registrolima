@echo off
setlocal enabledelayedexpansion
title VOTO REAL - COMPARTIR EN LINEA - Sistema Electoral Lima
color 0A
cls

echo ============================================================
echo        VOTO REAL - COMPARTIR EN LINEA
echo        Sistema Electoral Lima
echo ============================================================
echo.

REM -- Verificar que el servidor Vite este corriendo --
echo [1/3] Verificando servidor local en puerto 3180...
netstat -ano | findstr :3180 > nul
if errorlevel 1 (
    echo  [!] Servidor no esta corriendo. Iniciando Vite...
    start "Servidor Vite - Puerto 3180" cmd /k "cd /d %~dp0 && npm run dev"
    echo  Esperando que el servidor arranque ^(5 seg^)...
    timeout /t 5 > nul
    netstat -ano | findstr :3180 > nul
    if errorlevel 1 (
        echo  [ERROR] No se pudo iniciar el servidor. Asegurate de tener Node.js instalado.
        pause
        exit /b 1
    )
) else (
    echo  [OK] Servidor activo en http://localhost:3180
)

echo.
echo [2/3] Detectando IPs de red local...
echo.
echo  --------------------------------------------------------------
echo   ACCESO EN RED LOCAL ^(Wi-Fi / LAN^):
echo  --------------------------------------------------------------
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "rawip=%%a"
    set "rawip=!rawip: =!"
    if not "!rawip!"=="127.0.0.1" (
        echo    -^> http://!rawip!:3180
    )
)
echo.
echo   Usuario:     admin
echo   Contrasena:  admin2024
echo  --------------------------------------------------------------
echo.

echo [3/3] Generando enlace publico para Internet...
echo.

REM -- Intentar con SSH (serveo.net) primero --
where ssh >nul 2>&1
if not errorlevel 1 (
    echo  Usando SSH -^> serveo.net
    echo  El enlace aparecera abajo ^(puede tardar unos segundos^):
    echo  Formato: https://XXXX.serveousercontent.com
    echo.
    echo  ^(Presiona Ctrl+C para detener el tunel^)
    echo  ============================================================
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:3180 serveo.net
) else (
    REM -- Fallback: usar cloudflared.exe --
    echo  SSH no disponible. Usando cloudflared como alternativa...
    if not exist "%~dp0cloudflared.exe" (
        echo  Descargando cloudflared...
        powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '%~dp0cloudflared.exe'"
    )
    echo  El enlace aparecera abajo:
    echo  Formato: https://XXXX.trycloudflare.com
    echo.
    echo  ^(Presiona Ctrl+C para detener el tunel^)
    echo  ============================================================
    "%~dp0cloudflared.exe" tunnel --url http://localhost:3180
)

pause
