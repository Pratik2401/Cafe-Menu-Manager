#!/bin/bash
# Setup local MongoDB on Lightsail instance

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and admin user
mongo << 'EOF'
use demomenu
db.createUser({
  user: "demouser",
  pwd: "demopass123",
  roles: [{ role: "readWrite", db: "demomenu" }]
})
exit
EOF

# Restart backend
pm2 restart demomenu-backend

echo "MongoDB setup complete!"
echo "Database: demomenu"
echo "User: demouser"
echo "Connection: mongodb://demouser:demopass123@localhost:27017/demomenu"