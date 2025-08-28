# AWS Lightsail Demo Menu Deployment Guide

## Prerequisites

1. **AWS Lightsail Instance**
   - Ubuntu 20.04 LTS or newer
   - At least 2GB RAM, 1 vCPU
   - Static IP assigned
   - Domain `demo.snap2eat.in` pointing to the static IP

2. **Local Setup**
   - SSH key pair for Lightsail instance
   - Git Bash or WSL (for Windows users)
   - Node.js installed locally

## AWS Lightsail Setup

### 1. Create Lightsail Instance
1. Go to AWS Lightsail Console
2. Click "Create instance"
3. Select "Linux/Unix" platform
4. Choose "Ubuntu 20.04 LTS" blueprint
5. Select instance plan (minimum $5/month - 1GB RAM)
6. Name your instance (e.g., "demo-menu-server")
7. Click "Create instance"

### 2. Configure Static IP
1. In Lightsail console, go to "Networking" tab
2. Click "Create static IP"
3. Select your instance
4. Name the static IP (e.g., "demo-menu-ip")
5. Click "Create"
6. Note the static IP address

### 3. Setup Domain/Subdomain

#### Option A: Using Lightsail DNS Zone
1. In Lightsail console, go to "Networking" > "DNS zones"
2. Click "Create DNS zone"
3. Enter your domain (e.g., "snap2eat.in")
4. Click "Create DNS zone"
5. Add A record:
   - Record name: "demo"
   - Resolves to: Select your static IP
   - Click "Save"
6. Update your domain registrar's nameservers to Lightsail's nameservers

#### Option B: Using External DNS Provider
1. Go to your DNS provider (Cloudflare, GoDaddy, etc.)
2. Add A record:
   - Name: "demo"
   - Value: Your Lightsail static IP
   - TTL: 300 (5 minutes)
3. Save the record

### 4. Configure Firewall
1. In your Lightsail instance, go to "Networking" tab
2. Add firewall rules:
   - HTTP (port 80) - Allow all
   - HTTPS (port 443) - Allow all
   - SSH (port 22) - Allow all (or restrict to your IP)
   - Custom (port 5001) - Allow all (for backend API)

### 5. Download SSH Key
1. In Lightsail console, go to "Account" > "SSH keys"
2. Download the default key or create a new one
3. Save as `~/.ssh/lightsail-key.pem`
4. Set permissions: `chmod 400 ~/.ssh/lightsail-key.pem`

## Initial Server Setup

### 1. Connect to your Lightsail instance:
```bash
ssh -i ~/.ssh/lightsail-key.pem ubuntu@demo.snap2eat.in
```

### 2. Run the setup commands:
```bash
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

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Start services
sudo systemctl start mongod nginx
sudo systemctl enable mongod nginx

# Create application directory
sudo mkdir -p /opt/demomenu
sudo chown -R ubuntu:ubuntu /opt/demomenu

# Create log directory
sudo mkdir -p /var/log/demomenu
sudo chown -R ubuntu:ubuntu /var/log/demomenu
```

## SSL Certificate Setup

### Option 1: Let's Encrypt (Recommended)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d demo.snap2eat.in
```

**Note:** Ensure your domain is pointing to the server before running certbot.

### Option 2: Manual Certificate
Place your SSL certificate files:
- `/etc/ssl/certs/demo.snap2eat.in.crt`
- `/etc/ssl/private/demo.snap2eat.in.key`

### Verify SSL Setup
```bash
# Test SSL certificate
sudo nginx -t

# Check certificate expiry
sudo certbot certificates

# Auto-renewal (Let's Encrypt)
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Deployment Commands

### Backend Only Deployment:
```bash
# Windows
deploy-backend-only.bat

# Linux/Mac
chmod +x deploy-backend-only.sh
./deploy-backend-only.sh
```

### Frontend Upload:
Upload your build files directly to: `/opt/demomenu/frontend/dist/`

## Manual Deployment Steps

### Backend Deployment:

1. **Upload backend files:**
```bash
cd backend
tar -czf ../backend-deploy.tar.gz --exclude=node_modules --exclude=.env .
scp -i ~/.ssh/lightsail-key.pem ../backend-deploy.tar.gz ubuntu@demo.snap2eat.in:/tmp/
```

2. **Deploy on server:**
```bash
ssh -i ~/.ssh/lightsail-key.pem ubuntu@demo.snap2eat.in
sudo mkdir -p /opt/demomenu/backend
cd /opt/demomenu/backend
sudo tar -xzf /tmp/backend-deploy.tar.gz
sudo chown -R ubuntu:ubuntu /opt/demomenu
npm install --production
```

3. **Configure environment:**
```bash
cat > .env << 'EOF'
MONGODB_URI=mongodb://localhost:27017/demomenu
JWT_SECRET=your_production_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5001
NODE_ENV=production
UPLOAD_DIR=/opt/demomenu/uploads
EOF
```

4. **Start with PM2:**
```bash
cp /path/to/ecosystem.config.js .
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Frontend Upload:

1. **Build locally:**
```bash
cd frontend
npm install
npm run build
```

2. **Upload build files:**
Upload contents of `dist/` folder to `/opt/demomenu/frontend/dist/` on server

### Nginx Configuration:

1. **Upload nginx config:**
```bash
scp -i ~/.ssh/lightsail-key.pem lightsail-nginx.conf ubuntu@demo.snap2eat.in:/tmp/
```

2. **Configure nginx:**
```bash
ssh -i ~/.ssh/lightsail-key.pem ubuntu@demo.snap2eat.in
sudo cp /tmp/lightsail-nginx.conf /etc/nginx/sites-available/demomenu
sudo ln -sf /etc/nginx/sites-available/demomenu /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## Post-Deployment

### 1. Create Admin User:
```bash
ssh -i ~/.ssh/lightsail-key.pem ubuntu@demo.snap2eat.in
cd /opt/demomenu/backend
node seeds/createAdmin.js
```

### 2. Verify Services:
```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check MongoDB status
sudo systemctl status mongod

# Check application logs
pm2 logs demomenu-backend
```

### 3. Test Application:
- Visit: https://demo.snap2eat.in
- API Health: https://demo.snap2eat.in/api/customer/items

## Monitoring & Maintenance

### PM2 Commands:
```bash
pm2 status                    # Check status
pm2 restart demomenu-backend  # Restart app
pm2 logs demomenu-backend     # View logs
pm2 monit                     # Monitor resources
```

### Nginx Commands:
```bash
sudo nginx -t                 # Test configuration
sudo systemctl reload nginx   # Reload configuration
sudo systemctl restart nginx  # Restart nginx
```

### MongoDB Commands:
```bash
sudo systemctl status mongod  # Check status
mongo                         # Connect to MongoDB
```

## Troubleshooting

### Common Issues:

1. **Port 5001 not accessible:**
   - Check if PM2 is running: `pm2 status`
   - Check firewall: `sudo ufw status`

2. **Nginx 502 Bad Gateway:**
   - Verify backend is running on port 5001
   - Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

3. **SSL Certificate Issues:**
   - Verify certificate files exist and have correct permissions
   - Test with: `sudo nginx -t`

4. **File Upload Issues:**
   - Check uploads directory permissions: `ls -la /opt/demomenu/uploads`
   - Ensure nginx user can write: `sudo chown -R www-data:www-data /opt/demomenu/uploads`

5. **Domain Not Resolving:**
   - Check DNS propagation: `nslookup demo.snap2eat.in`
   - Verify A record points to correct IP: `dig demo.snap2eat.in`
   - Wait for DNS propagation (up to 48 hours)

6. **Lightsail Instance Issues:**
   - Check instance status in Lightsail console
   - Verify static IP is attached
   - Check firewall rules allow HTTP/HTTPS traffic

### Log Locations:
- Application logs: `/var/log/demomenu/`
- Nginx logs: `/var/log/nginx/`
- MongoDB logs: `/var/log/mongodb/`
- PM2 logs: `~/.pm2/logs/`

## DNS Verification Commands

```bash
# Check if domain resolves to your IP
nslookup demo.snap2eat.in

# Detailed DNS lookup
dig demo.snap2eat.in

# Check from different DNS servers
nslookup demo.snap2eat.in 8.8.8.8
nslookup demo.snap2eat.in 1.1.1.1

# Test HTTP/HTTPS connectivity
curl -I http://demo.snap2eat.in
curl -I https://demo.snap2eat.in
```