@echo off
REM Demo Menu Backend Deployment Script for Windows
REM Usage: deploy-backend-only.bat

set LIGHTSAIL_IP=demo.snap2eat.in
set SSH_KEY_PATH=%USERPROFILE%\.ssh\lightsail-key.pem
set REMOTE_USER=ubuntu

echo ========================================
echo   Deploying Backend to AWS Lightsail
echo ========================================

echo [1/4] Creating backend deployment package...
cd backend
tar -czf ..\backend-deploy.tar.gz --exclude=node_modules --exclude=.env .
if %errorlevel% neq 0 (
    echo ERROR: Failed to create package
    pause
    exit /b 1
)
cd ..

echo [2/4] Uploading backend to server...
scp -i %SSH_KEY_PATH% backend-deploy.tar.gz %REMOTE_USER%@%LIGHTSAIL_IP%:/tmp/
if %errorlevel% neq 0 (
    echo ERROR: Failed to upload
    pause
    exit /b 1
)

echo [3/4] Installing backend on server...
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
echo sudo mkdir -p /var/log/demomenu >> deploy-backend.sh
echo sudo chown -R ubuntu:ubuntu /var/log/demomenu >> deploy-backend.sh

scp -i %SSH_KEY_PATH% deploy-backend.sh %REMOTE_USER%@%LIGHTSAIL_IP%:/tmp/
ssh -i %SSH_KEY_PATH% %REMOTE_USER%@%LIGHTSAIL_IP% "chmod +x /tmp/deploy-backend.sh && /tmp/deploy-backend.sh"

echo [4/4] Starting backend with PM2...
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
echo.
echo Upload your frontend build files to: /opt/demomenu/frontend/dist/
pause