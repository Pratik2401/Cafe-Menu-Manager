#!/bin/bash

# Backup current nginx config
sudo cp /etc/nginx/sites-available/demomenu /etc/nginx/sites-available/demomenu.backup

# Create HTTP-only nginx config
sudo tee /etc/nginx/sites-available/demomenu << 'EOF'
server {
    listen 80;
    server_name demo.snap2eat.in;

    # Frontend
    location / {
        root /opt/demomenu/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API
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

    # Uploads
    location /uploads/ {
        alias /opt/demomenu/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx