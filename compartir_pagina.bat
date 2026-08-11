@echo off
setlocal
title ConteoLima - Compartir en Linea

echo ========================================================
echo        CONTEOLIMA - COMPARTIR PAGINA EN LINEA
echo ========================================================
echo.

echo [1/2] Iniciando servidor local en puerto 3180...
start "Servidor Local" /min cmd /c "npm run dev"

echo.
echo [2/2] Generando enlace publico con Cloudflare...
echo.
echo ========================================================
echo   INSTRUCCIONES:
echo   1. Copia el enlace HTTPS que aparece abajo.
echo      Formato: https://xxxx.trycloudflare.com
echo.
echo   2. Pasale ese enlace a cualquier persona.
echo      Podran abrirlo en su PC o Celular (4G/5G/Wi-Fi).
echo.
echo   3. El enlace se mantendra ACTIVO hasta que cierres
echo      esta ventana o apagues tu laptop.
echo.
echo   USUARIO ADMINISTRADOR: eric  (o admin)
echo   CONTRASENA:           admin123 (o eric123)
echo ========================================================
echo.

"%~dp0cloudflared.exe" tunnel --url http://localhost:3180

pause
