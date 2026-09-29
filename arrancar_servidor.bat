@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title ConteoLima - Servidor Local
chcp 65001 >nul

echo ====================================================
echo        CONTEOLIMA - SERVIDOR LOCAL (PC / WI-FI)
echo ====================================================
echo.

echo [1/2] Verificando servidores locales en puerto 3000 y 3180...
set BACKEND_RUNNING=0
set FRONTEND_RUNNING=0

netstat -aon | findstr ":3000" | findstr "LISTENING" >nul && set BACKEND_RUNNING=1
netstat -aon | findstr ":3180" | findstr "LISTENING" >nul && set FRONTEND_RUNNING=1

if %BACKEND_RUNNING%==0 (
    powershell -NoProfile -Command "Start-Process -FilePath 'node' -ArgumentList 'src/server.js' -WorkingDirectory '%~dp0backend' -WindowStyle Hidden"
)
if %FRONTEND_RUNNING%==0 (
    powershell -NoProfile -Command "Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory '%~dp0frontend' -WindowStyle Hidden"
)

echo Servidores locales activos en puertos 3000 (API) y 3180 (Web).
echo.

set LOCAL_IP=
for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.InterfaceAlias -notlike '*Loopback*' -and $_.InterfaceAlias -notlike '*vEthernet*'} | Select-Object -First 1).IPAddress"`) do (
    set LOCAL_IP=%%a
)

echo ====================================================
echo ACCESO LOCAL:
echo * Desde esta PC:       http://localhost:3180
if defined LOCAL_IP (
    echo * Desde Celular Wi-Fi: http://!LOCAL_IP!:3180
)
echo ====================================================
echo.
echo Abriendo navegador...
start http://localhost:3180
echo.
echo Presione cualquier tecla para salir...
pause >nul
