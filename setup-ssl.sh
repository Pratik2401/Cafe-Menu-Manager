#!/bin/bash

# First, ensure HTTP-only config is working
sudo tee /etc/nginx/sites-available/demomenu << 'EOF'
server {
    listen 80;
    server_name demo.snap2eat.in;

    location / {
        root /opt/demomenu/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

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

    location /uploads/ {
        alias /opt/demomenu/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Test nginx config
sudo nginx -t

# If test passes, reload nginx
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "HTTP configuration loaded successfully"
    
    # Now setup SSL with Let's Encrypt
    echo "Setting up SSL certificate..."
    sudo certbot --nginx -d demo.snap2eat.in --non-interactive --agree-tos --email admin@snap2eat.in
    
    if [ $? -eq 0 ]; then
        echo "SSL certificate installed successfully!"
        sudo nginx -t && sudo systemctl reload nginx
    else
        echo "SSL setup failed. Check if domain is pointing to this server."
        echo "You can run: nslookup demo.snap2eat.in"
    fi
else
    echo "Nginx configuration test failed"
fi