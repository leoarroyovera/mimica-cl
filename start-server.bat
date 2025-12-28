@echo off
echo Iniciando servidor local...
echo.

REM Intentar usar Python primero
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Usando Python para iniciar el servidor...
    python server.py
    goto :end
)

REM Si Python no está disponible, intentar Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Usando Node.js para iniciar el servidor...
    node server.js
    goto :end
)

REM Si ninguno está disponible, mostrar mensaje
echo ERROR: No se encontró Python ni Node.js instalado.
echo.
echo Por favor instala uno de los siguientes:
echo - Python: https://www.python.org/downloads/
echo - Node.js: https://nodejs.org/
echo.
echo O usa una extension del navegador como "Live Server" para VS Code
pause

:end

