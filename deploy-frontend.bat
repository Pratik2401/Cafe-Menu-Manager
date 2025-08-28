@echo off
echo ========================================
echo   TopchiOutpost Frontend Deployment
echo   Target: demo.snap2eat.in
echo ========================================

cd frontend

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [2/4] Creating production environment...
echo VITE_API_URL_ADMIN=https://demo.snap2eat.in/api/admin > .env.production
echo VITE_API_URL_CUSTOMER=https://demo.snap2eat.in/api/customer >> .env.production
echo VITE_API_URL_BASE=https://demo.snap2eat.in >> .env.production
echo VITE_THEME_URL=https://demo.snap2eat.in >> .env.production

echo [3/4] Building production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo [4/4] Deployment ready!
echo Build files are in: frontend/dist/
echo Upload the contents of 'dist' folder to demo.snap2eat.in
echo.
echo Next steps:
echo 1. Upload dist/* to your web server
echo 2. Configure web server to serve index.html for all routes
echo 3. Ensure HTTPS is enabled
echo.
pause