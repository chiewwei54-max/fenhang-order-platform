@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo   分行订货平台 - 正在启动...
echo ========================================
echo.

powershell -NoProfile -Command "try { (Invoke-WebRequest -Uri 'http://localhost:8090/login.html' -UseBasicParsing -TimeoutSec 2).StatusCode | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
  echo 本地服务未运行，正在启动...
  start "分行订货平台服务" cmd /k "%~dp0start-server.cmd"
  echo 等待服务就绪...
  timeout /t 4 /nobreak >nul
) else (
  echo 本地服务已在运行。
)

start "" "http://localhost:8090/login.html"

echo.
echo 已在浏览器打开：http://localhost:8090/login.html
echo 登录账号：admin
echo 登录密码：123456
echo.
echo 提示：请勿直接双击 login.html / index.html
echo       请始终使用本「打开平台.bat」启动。
echo.
pause
