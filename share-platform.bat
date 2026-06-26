@echo off
chcp 65001 >nul
cd /d "%~dp0"

set PORT=8090

echo.
echo ========================================
echo   分行订货平台 - 局域网共享启动
echo ========================================
echo.

powershell -NoProfile -Command "try { (Invoke-WebRequest -Uri 'http://localhost:%PORT%/login.html' -UseBasicParsing -TimeoutSec 2).StatusCode | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
  echo 本地服务未运行，正在启动...
  start "分行订货平台服务" cmd /k "%~dp0start-server.cmd"
  echo 等待服务就绪...
  timeout /t 4 /nobreak >nul
) else (
  echo 本地服务已在运行。
)

for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "$ip = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1 -ExpandProperty IPAddress; if ($ip) { $ip }"`) do set LOCAL_IP=%%i

echo.
echo 本机访问：
echo   http://localhost:%PORT%/login.html
echo.
if defined LOCAL_IP (
  echo 同一个 Wi-Fi / 局域网内其他设备访问：
  echo   http://%LOCAL_IP%:%PORT%/login.html
) else (
  echo 未检测到局域网 IP，请确认电脑已连接 Wi-Fi 或网线。
)
echo.
echo 登录账号：admin
echo 登录密码：123456
echo.
echo 如果其他设备打不开，请允许 Windows 防火墙访问端口 %PORT%，
echo 或右键以管理员身份运行本文件。
echo.

start "" "http://localhost:%PORT%/login.html"
pause
