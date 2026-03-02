@echo off

set PORT=5000
set DEPLOY_RUN_PORT=5000

echo Clearing port %PORT% before start.

:: 清理端口占用
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%DEPLOY_RUN_PORT%') do (
    echo Port %DEPLOY_RUN_PORT% in use by PID: %%a (SIGKILL)
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo Failed to kill process %%a
    ) else (
        echo Successfully killed process %%a
    )
)

:: 等待一秒
ping -n 2 127.0.0.1 >nul

echo Starting HTTP service on port %PORT% for dev...
npx vite --port %PORT%
