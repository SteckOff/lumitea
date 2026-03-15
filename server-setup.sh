#!/bin/bash

# Lumi Tea - Quick Server Setup from GitHub
# Run this on your Vultr server to setup everything from GitHub

set -e

echo "🍵 Lumi Tea Server Setup from GitHub"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
GITHUB_USER=""
REPO_NAME="lumitea"
APP_DIR="/var/www/lumitea"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Ask for GitHub username
if [ -z "$GITHUB_USER" ]; then
    read -p "Enter your GitHub username: " GITHUB_USER
fi

echo -e "${BLUE}Setting up Lumi Tea from github.com/$GITHUB_USER/$REPO_NAME${NC}"
echo ""

# Step 1: Install git
echo -e "${YELLOW}[1/8] Installing git...${NC}"
apt-get update -qq
apt-get install -y -qq git curl

# Step 2: Install Node.js
echo -e "${YELLOW}[2/8] Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y -qq nodejs
fi
echo -e "${GREEN}✓ Node.js $(node --version) installed${NC}"

# Step 3: Install PM2
echo -e "${YELLOW}[3/8] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2 > /dev/null 2>&1
fi
echo -e "${GREEN}✓ PM2 installed${NC}"

# Step 4: Install Nginx
echo -e "${YELLOW}[4/8] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y -qq nginx
    systemctl enable nginx > /dev/null 2>&1
fi
echo -e "${GREEN}✓ Nginx installed${NC}"

# Step 5: Clone repository
echo -e "${YELLOW}[5/8] Cloning repository...${NC}"
if [ -d "$APP_DIR" ]; then
    echo "Removing old installation..."
    rm -rf $APP_DIR
fi

cd /var/www
git clone https://github.com/$GITHUB_USER/$REPO_NAME.git lumitea
echo -e "${GREEN}✓ Repository cloned${NC}"

# Step 6: Setup backend
echo -e "${YELLOW}[6/8] Setting up backend...${NC}"
cd $APP_DIR/backend
npm install > /dev/null 2>&1

# Create data directory
mkdir -p data

# Start with PM2
if pm2 status | grep -q "lumitea-backend"; then
    pm2 restart lumitea-backend
else
    pm2 start server.js --name lumitea-backend
fi

pm2 save > /dev/null 2>&1
echo -e "${GREEN}✓ Backend running${NC}"

# Step 7: Setup Nginx
echo -e "${YELLOW}[7/8] Setting up Nginx...${NC}"

if [ -f "$APP_DIR/nginx.conf" ]; then
    cp $APP_DIR/nginx.conf /etc/nginx/sites-available/lumitea
else
    # Create default nginx config
    cat > /etc/nginx/sites-available/lumitea << 'EOF'
server {
    listen 80;
    server_name lumitea.kr www.lumitea.kr;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name lumitea.kr www.lumitea.kr;
    
    ssl_certificate /etc/letsencrypt/live/lumitea.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lumitea.kr/privkey.pem;
    
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        root /var/www/lumitea/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
EOF
fi

ln -sf /etc/nginx/sites-available/lumitea /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
echo -e "${GREEN}✓ Nginx configured${NC}"

# Step 8: Setup firewall
echo -e "${YELLOW}[8/8] Setting up firewall...${NC}"
ufw default deny incoming > /dev/null 2>&1
ufw default allow outgoing > /dev/null 2>&1
ufw allow ssh > /dev/null 2>&1
ufw allow http > /dev/null 2>&1
ufw allow https > /dev/null 2>&1
ufw allow 3001 > /dev/null 2>&1
ufw --force enable > /dev/null 2>&1
echo -e "${GREEN}✓ Firewall configured${NC}"

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}🎉 Setup completed!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Setup SSL: certbot --nginx -d lumitea.kr -d www.lumitea.kr"
echo "2. Build frontend: cd /var/www/lumitea/frontend && npm install && npm run build"
echo "3. Copy frontend: cp -r dist/* /var/www/lumitea/frontend/dist/"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  pm2 status           - Check backend status"
echo "  pm2 logs             - View logs"
echo "  ./deploy.sh          - Update from GitHub"
echo ""
echo -e "${BLUE}Website:${NC} https://lumitea.kr"
echo -e "${BLUE}Admin:${NC} https://lumitea.kr/admin"
echo ""
