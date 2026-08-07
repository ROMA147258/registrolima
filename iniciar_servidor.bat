@echo off
title Servidor RegistroConteo - Puerto 3180
echo ==========================================================
echo           INICIANDO SERVIDOR PARA EL APLICATIVO
echo ==========================================================
echo.
echo Detectando tu direccion IP local...
for /f "tokens=4 delims= " %%i in ('route print ^| findstr 0.0.0.0 ^| findstr /v "127.0.0.1"') do (
    set LOCAL_IP=%%i
)
echo IP de la Laptop: %LOCAL_IP%
echo.
echo Para abrir el aplicativo desde tu celular, asegurate de que 
echo este conectado a la misma red Wi-Fi y abre este enlace:
echo.
echo   👉 http://%LOCAL_IP%:3180
echo.
echo ==========================================================
echo.
npm run dev
pause
