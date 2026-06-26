@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-Expression (Get-Content -LiteralPath '.\storage\server-tcp.txt' -Raw -Encoding UTF8)"
pause
