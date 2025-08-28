#!/bin/bash
# Run this script on your Lightsail instance via browser SSH

# Navigate to backend directory
cd /opt/demomenu/backend

# Install dependencies
npm install --production

# Create environment file
cat > .env << 'EOF'
MONGODB_URI=mongodb://localhost:27017/demomenu
JWT_SECRET=your_production_jwt_secret_here_change_this
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5001
NODE_ENV=production
UPLOAD_DIR=/opt/demomenu/uploads
EOF

# Create directories
sudo mkdir -p /opt/demomenu/uploads /var/log/demomenu
sudo chown -R ubuntu:ubuntu /opt/demomenu /var/log/demomenu

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
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
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup Nginx
sudo cp /path/to/lightsail-nginx.conf /etc/nginx/sites-available/demomenu
sudo ln -sf /etc/nginx/sites-available/demomenu /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "Services started! Check status with:"
echo "pm2 status"
echo "sudo systemctl status nginx"