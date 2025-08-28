@echo off
REM Demo Menu AWS Lightsail Deployment Script for Windows
REM Usage: deploy-lightsail.bat [frontend|backend|full|setup]

set LIGHTSAIL_IP=demo.snap2eat.in
set SSH_KEY_PATH=%USERPROFILE%\.ssh\lightsail-key.pem
set REMOTE_USER=ubuntu

if "%1"=="setup" goto setup
if "%1"=="backend" goto deploy_backend
if "%1"=="frontend" goto deploy_frontend
if "%1"=="full" goto deploy_full
goto usage

:setup
echo ========================================
echo   Setting up AWS Lightsail Server
echo ========================================
echo.
echo Please run the following commands on your Lightsail instance:
echo.
echo sudo apt update ^&^& sudo apt upgrade -y
echo curl -fsSL https://deb.nodesource.com/setup_18.x ^| sudo -E bash -
echo sudo apt-get install -y nodejs nginx mongodb-org
echo sudo npm install -g pm2
echo sudo systemctl start mongod nginx
echo sudo systemctl enable mongod nginx
echo sudo mkdir -p /opt/demomenu
echo sudo chown -R ubuntu:ubuntu /opt/demomenu
echo.
pause
goto end

:deploy_backend
echo ========================================
echo   Deploying Backend to AWS Lightsail
echo ========================================

echo [1/5] Creating backend deployment package...
cd backend
tar -czf ..\backend-deploy.tar.gz --exclude=node_modules --exclude=.env .
if %errorlevel% neq 0 (
    echo ERROR: Failed to create package
    pause
    exit /b 1
)
cd ..

echo [2/5] Uploading backend to server...
scp -i %SSH_KEY_PATH% backend-deploy.tar.gz %REMOTE_USER%@%LIGHTSAIL_IP%:/tmp/
if %errorlevel% neq 0 (
    echo ERROR: Failed to upload
    pause
    exit /b 1
)

echo [3/5] Creating deployment script...
echo #!/bin/bash > deploy-backend.sh
echo sudo mkdir -p /opt/demomenu/backend >> deploy-backend.sh
echo cd /opt/demomenu/backend >> deploy-backend.sh
echo sudo tar -xzf /tmp/backend-deploy.tar.gz >> deploy-backend.sh
echo sudo chown -R ubuntu:ubuntu /opt/demomenu >> deploy-backend.sh
echo npm install --production >> deploy-backend.sh
echo cat ^> .env ^<^< 'EOF' >> deploy-backend.sh
echo MONGODB_URI=mongodb://localhost:27017/demomenu >> deploy-backend.sh
echo JWT_SECRET=your_production_jwt_secret_here >> deploy-backend.sh
echo EMAIL_USER=your_email@gmail.com >> deploy-backend.sh
echo EMAIL_PASS=your_app_password >> deploy-backend.sh
echo PORT=5001 >> deploy-backend.sh
echo NODE_ENV=production >> deploy-backend.sh
echo UPLOAD_DIR=/opt/demomenu/uploads >> deploy-backend.sh
echo EOF >> deploy-backend.sh
echo sudo mkdir -p /opt/demomenu/uploads >> deploy-backend.sh
echo sudo chown -R ubuntu:ubuntu /opt/demomenu/uploads >> deploy-backend.sh

echo [4/5] Uploading and executing deployment script...
scp -i %SSH_KEY_PATH% deploy-backend.sh %REMOTE_USER%@%LIGHTSAIL_IP%:/tmp/
ssh -i %SSH_KEY_PATH% %REMOTE_USER%@%LIGHTSAIL_IP% "chmod +x /tmp/deploy-backend.sh && /tmp/deploy-backend.sh"

echo [5/5] Starting backend with PM2...
echo cat ^> /tmp/ecosystem.config.js ^<^< 'EOF' > pm2-config.sh
echo module.exports = { >> pm2-config.sh
echo   apps: [{ >> pm2-config.sh
echo     name: 'demomenu-backend', >> pm2-config.sh
echo     script: 'server.js', >> pm2-config.sh
echo     cwd: '/opt/demomenu/backend', >> pm2-config.sh
echo     instances: 1, >> pm2-config.sh
echo     exec_mode: 'fork', >> pm2-config.sh
echo     env: { NODE_ENV: 'production', PORT: 5001 } >> pm2-config.sh
echo   }] >> pm2-config.sh
echo }; >> pm2-config.sh
echo EOF >> pm2-config.sh
echo cd /opt/demomenu/backend >> pm2-config.sh
echo cp /tmp/ecosystem.config.js . >> pm2-config.sh
echo pm2 start ecosystem.config.js >> pm2-config.sh
echo pm2 save >> pm2-config.sh

scp -i %SSH_KEY_PATH% pm2-config.sh %REMOTE_USER%@%LIGHTSAIL_IP%:/tmp/
ssh -i %SSH_KEY_PATH% %REMOTE_USER%@%LIGHTSAIL_IP% "chmod +x /tmp/pm2-config.sh && /tmp/pm2-config.sh"

echo Backend deployment complete!
del backend-deploy.tar.gz deploy-backend.sh pm2-config.sh
goto end

:deploy_frontend
echo ========================================
echo   Deploying Frontend to AWS Lightsail
echo ========================================

echo [1/4] Building frontend...
cd frontend

echo VITE_API_URL_ADMIN=https://demo.snap2eat.in/api/admin > .env.production
echo VITE_API_URL_CUSTOMER=https://demo.snap2eat.in/api/customer >> .env.production
echo VITE_API_URL_BASE=https://demo.snap2eat.in >> .env.production
echo VITE_THEME_URL=https://demo.snap2eat.in >> .env.production

call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo [2/4] Creating deployment package...
cd dist
tar -czf ..\..\frontend-deploy.tar.gz .
cd ..\..

echo [3/4] Uploading to server...
scp -i %SSH_KEY_PATH% frontend-deploy.tar.gz %REMOTE_USER%@%LIGHTSAIL_IP%:/tmp/

echo [4/4] Deploying frontend...
echo #!/bin/bash > deploy-frontend.sh
echo sudo mkdir -p /opt/demomenu/frontend/dist >> deploy-frontend.sh
echo cd /opt/demomenu/frontend/dist >> deploy-frontend.sh
echo sudo tar -xzf /tmp/frontend-deploy.tar.gz >> deploy-frontend.sh
echo sudo chown -R ubuntu:ubuntu /opt/demomenu/frontend >> deploy-frontend.sh
echo sudo systemctl reload nginx >> deploy-frontend.sh

scp -i %SSH_KEY_PATH% deploy-frontend.sh %REMOTE_USER%@%LIGHTSAIL_IP%:/tmp/
ssh -i %SSH_KEY_PATH% %REMOTE_USER%@%LIGHTSAIL_IP% "chmod +x /tmp/deploy-frontend.sh && /tmp/deploy-frontend.sh"

echo Frontend deployment complete!
del frontend-deploy.tar.gz deploy-frontend.sh
goto end

:deploy_full
call %0 backend
call %0 frontend
goto end

:usage
echo Usage: %0 [frontend^|backend^|full^|setup]
echo.
echo Commands:
echo   setup    - Show server setup instructions
echo   backend  - Deploy backend only
echo   frontend - Deploy frontend only
echo   full     - Deploy both backend and frontend
echo.
echo Prerequisites:
echo   - SSH key configured at %SSH_KEY_PATH%
echo   - tar command available (install Git Bash or WSL)
echo   - scp and ssh commands available
pause
goto end

:end
echo.
echo Deployment process completed!
echo Your application should be available at: https://demo.snap2eat.in
pause