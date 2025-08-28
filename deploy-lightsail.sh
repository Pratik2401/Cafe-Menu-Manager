#!/bin/bash

# Demo Menu AWS Lightsail Deployment Script
# Usage: ./deploy-lightsail.sh [frontend|backend|full]

set -e

LIGHTSAIL_IP="demo.snap2eat.in"
SSH_KEY_PATH="~/.ssh/lightsail-key.pem"
REMOTE_USER="ubuntu"
APP_DIR="/opt/demomenu"

deploy_backend() {
    echo "========================================"
    echo "  Deploying Backend to AWS Lightsail"
    echo "========================================"
    
    # Create deployment package
    echo "[1/6] Creating backend deployment package..."
    cd backend
    tar -czf ../backend-deploy.tar.gz --exclude=node_modules --exclude=.env .
    cd ..
    
    # Upload to server
    echo "[2/6] Uploading backend to server..."
    scp -i $SSH_KEY_PATH backend-deploy.tar.gz $REMOTE_USER@$LIGHTSAIL_IP:/tmp/
    
    # Deploy on server
    echo "[3/6] Installing backend on server..."
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$LIGHTSAIL_IP << 'EOF'
        sudo mkdir -p /opt/demomenu/backend
        cd /opt/demomenu/backend
        sudo tar -xzf /tmp/backend-deploy.tar.gz
        sudo chown -R ubuntu:ubuntu /opt/demomenu
        
        # Install dependencies
        npm install --production
        
        # Create production environment
        cat > .env << 'ENVEOF'
MONGODB_URI=mongodb://localhost:27017/demomenu
JWT_SECRET=your_production_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5001
NODE_ENV=production
UPLOAD_DIR=/opt/demomenu/uploads
ENVEOF
        
        # Create uploads directory
        sudo mkdir -p /opt/demomenu/uploads
        sudo chown -R ubuntu:ubuntu /opt/demomenu/uploads
EOF
    
    echo "[4/6] Setting up PM2 process manager..."
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$LIGHTSAIL_IP << 'EOF'
        cd /opt/demomenu/backend
        
        # Create PM2 ecosystem file
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
        
        # Create log directory
        sudo mkdir -p /var/log/demomenu
        sudo chown -R ubuntu:ubuntu /var/log/demomenu
        
        # Start with PM2
        pm2 start ecosystem.config.js
        pm2 save
        pm2 startup
EOF
    
    echo "[5/6] Setting up Nginx reverse proxy..."
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$LIGHTSAIL_IP << 'EOF'
        # Create Nginx config
        sudo tee /etc/nginx/sites-available/demomenu << 'NGINXEOF'
server {
    listen 80;
    server_name demo.snap2eat.in;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name demo.snap2eat.in;
    
    # SSL Configuration (update paths as needed)
    ssl_certificate /etc/ssl/certs/demo.snap2eat.in.crt;
    ssl_certificate_key /etc/ssl/private/demo.snap2eat.in.key;
    
    # Frontend static files
    location / {
        root /opt/demomenu/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Theme CSS endpoint
    location /theme/ {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Uploads
    location /uploads/ {
        alias /opt/demomenu/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
NGINXEOF
        
        # Enable site
        sudo ln -sf /etc/nginx/sites-available/demomenu /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
EOF
    
    echo "[6/6] Backend deployment complete!"
    rm backend-deploy.tar.gz
}

deploy_frontend() {
    echo "========================================"
    echo "  Deploying Frontend to AWS Lightsail"
    echo "========================================"
    
    echo "[1/4] Building frontend..."
    cd frontend
    
    # Create production environment
    cat > .env.production << 'EOF'
VITE_API_URL_ADMIN=https://demo.snap2eat.in/api/admin
VITE_API_URL_CUSTOMER=https://demo.snap2eat.in/api/customer
VITE_API_URL_BASE=https://demo.snap2eat.in
VITE_THEME_URL=https://demo.snap2eat.in
EOF
    
    npm install
    npm run build
    
    echo "[2/4] Creating deployment package..."
    tar -czf ../frontend-deploy.tar.gz -C dist .
    cd ..
    
    echo "[3/4] Uploading to server..."
    scp -i $SSH_KEY_PATH frontend-deploy.tar.gz $REMOTE_USER@$LIGHTSAIL_IP:/tmp/
    
    echo "[4/4] Deploying frontend..."
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$LIGHTSAIL_IP << 'EOF'
        sudo mkdir -p /opt/demomenu/frontend/dist
        cd /opt/demomenu/frontend/dist
        sudo tar -xzf /tmp/frontend-deploy.tar.gz
        sudo chown -R ubuntu:ubuntu /opt/demomenu/frontend
        sudo systemctl reload nginx
EOF
    
    echo "Frontend deployment complete!"
    rm frontend-deploy.tar.gz
}

setup_server() {
    echo "========================================"
    echo "  Setting up AWS Lightsail Server"
    echo "========================================"
    
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$LIGHTSAIL_IP << 'EOF'
        # Update system
        sudo apt update && sudo apt upgrade -y
        
        # Install Node.js 18
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
        
        # Install MongoDB
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        sudo apt-get update
        sudo apt-get install -y mongodb-org
        sudo systemctl start mongod
        sudo systemctl enable mongod
        
        # Install Nginx
        sudo apt install -y nginx
        sudo systemctl start nginx
        sudo systemctl enable nginx
        
        # Install PM2
        sudo npm install -g pm2
        
        # Create application directory
        sudo mkdir -p /opt/demomenu
        sudo chown -R ubuntu:ubuntu /opt/demomenu
        
        echo "Server setup complete!"
EOF
}

case "$1" in
    "frontend")
        deploy_frontend
        ;;
    "backend")
        deploy_backend
        ;;
    "full")
        deploy_backend
        deploy_frontend
        ;;
    "setup")
        setup_server
        ;;
    *)
        echo "Usage: $0 [frontend|backend|full|setup]"
        echo ""
        echo "Commands:"
        echo "  setup    - Initial server setup (run once)"
        echo "  backend  - Deploy backend only"
        echo "  frontend - Deploy frontend only"
        echo "  full     - Deploy both backend and frontend"
        exit 1
        ;;
esac

echo ""
echo "Deployment completed successfully!"
echo "Your application should be available at: https://demo.snap2eat.in"