#!/bin/bash

# Demo Menu Backend Deployment Script
# Usage: ./deploy-backend-only.sh

set -e

LIGHTSAIL_IP="demo.snap2eat.in"
SSH_KEY_PATH="~/.ssh/lightsail-key.pem"
REMOTE_USER="ubuntu"

echo "========================================"
echo "  Deploying Backend to AWS Lightsail"
echo "========================================"

echo "[1/4] Creating backend deployment package..."
cd backend
tar -czf ../backend-deploy.tar.gz --exclude=node_modules --exclude=.env .
cd ..

echo "[2/4] Uploading backend to server..."
scp -i $SSH_KEY_PATH backend-deploy.tar.gz $REMOTE_USER@$LIGHTSAIL_IP:/tmp/

echo "[3/4] Installing backend on server..."
ssh -i $SSH_KEY_PATH $REMOTE_USER@$LIGHTSAIL_IP << 'EOF'
    sudo mkdir -p /opt/demomenu/backend
    cd /opt/demomenu/backend
    sudo tar -xzf /tmp/backend-deploy.tar.gz
    sudo chown -R ubuntu:ubuntu /opt/demomenu
    
    npm install --production
    
    cat > .env << 'ENVEOF'
MONGODB_URI=mongodb://localhost:27017/demomenu
JWT_SECRET=your_production_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5001
NODE_ENV=production
UPLOAD_DIR=/opt/demomenu/uploads
ENVEOF
    
    sudo mkdir -p /opt/demomenu/uploads
    sudo chown -R ubuntu:ubuntu /opt/demomenu/uploads
    
    sudo mkdir -p /var/log/demomenu
    sudo chown -R ubuntu:ubuntu /var/log/demomenu
EOF

echo "[4/4] Starting backend with PM2..."
ssh -i $SSH_KEY_PATH $REMOTE_USER@$LIGHTSAIL_IP << 'EOF'
    cd /opt/demomenu/backend
    
    cat > ecosystem.config.js << 'PMEOF'
module.exports = {
  apps: [{
    name: 'demomenu-backend',
    script: 'server.js',
    cwd: '/opt/demomenu/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: '/var/log/demomenu/error.log',
    out_file: '/var/log/demomenu/out.log',
    log_file: '/var/log/demomenu/combined.log',
    time: true
  }]
};
PMEOF
    
    pm2 start ecosystem.config.js
    pm2 save
EOF

echo "Backend deployment complete!"
rm backend-deploy.tar.gz
echo "Upload your frontend build files to: /opt/demomenu/frontend/dist/"