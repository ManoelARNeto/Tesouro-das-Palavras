@echo off
cd /d "%~dp0"
echo O TESOURO DAS PALAVRAS - ETAPA 2
echo Abra http://localhost:8000 no navegador.
echo Para encerrar o servidor, pressione Ctrl+C.
echo.
python -m http.server 8000
if errorlevel 1 (
 echo.
 echo Python nao encontrado. Instale Python 3 ou consulte README.md.
 pause
)
