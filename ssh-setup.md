# SSH Key Setup for AWS Lightsail

## Download SSH Key from AWS Lightsail

1. **Go to AWS Lightsail Console**
   - Navigate to https://lightsail.aws.amazon.com/
   - Sign in to your AWS account

2. **Download SSH Key**
   - Click on your instance name
   - Go to "Connect" tab
   - Click "Download default key" 
   - Save as `lightsail-key.pem`

3. **Place SSH Key in Correct Location**

### Windows:
```cmd
# Create .ssh directory if it doesn't exist
mkdir %USERPROFILE%\.ssh

# Copy the downloaded key
copy lightsail-key.pem %USERPROFILE%\.ssh\lightsail-key.pem
```

### Linux/Mac:
```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh

# Copy the downloaded key
cp lightsail-key.pem ~/.ssh/lightsail-key.pem

# Set correct permissions
chmod 400 ~/.ssh/lightsail-key.pem
```

## Test SSH Connection

```bash
ssh -i ~/.ssh/lightsail-key.pem ubuntu@demo.snap2eat.in
```

## Alternative: Use Lightsail Browser SSH

If SSH key setup is problematic, use Lightsail's browser-based SSH:

1. Go to AWS Lightsail Console
2. Click on your instance
3. Click "Connect using SSH" button
4. Run deployment commands directly in the browser terminal

## Manual Deployment via Browser SSH

```bash
# Upload backend files manually
# 1. Create deployment package locally:
cd backend
tar -czf backend-deploy.tar.gz --exclude=node_modules --exclude=.env .

# 2. Upload via SCP or use file transfer method
# 3. In Lightsail browser SSH, run:
sudo mkdir -p /opt/demomenu/backend
cd /opt/demomenu/backend
# Upload and extract your tar.gz file here
sudo chown -R ubuntu:ubuntu /opt/demomenu
npm install --production

# Create environment file
cat > .env << 'EOF'
MONGODB_URI=mongodb://localhost:27017/demomenu
JWT_SECRET=your_production_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5001
NODE_ENV=production
UPLOAD_DIR=/opt/demomenu/uploads
EOF

# Create directories
sudo mkdir -p /opt/demomenu/uploads /var/log/demomenu
sudo chown -R ubuntu:ubuntu /opt/demomenu /var/log/demomenu

# Start with PM2
npm install -g pm2
pm2 start server.js --name demomenu-backend
pm2 save
pm2 startup
```