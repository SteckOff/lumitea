#!/bin/bash

# Lumi Tea - Deployment Script
# Run this on your server to update from GitHub

set -e

echo "🍵 Lumi Tea Deployment Script"
echo "=============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_DIR="/var/www/lumitea"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

echo -e "${YELLOW}Step 1: Pulling latest changes...${NC}"
cd $APP_DIR
if [ -d ".git" ]; then
    git pull origin main
    echo -e "${GREEN}✓ Code updated${NC}"
else
    echo -e "${RED}✗ Not a git repository${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 2: Updating backend...${NC}"
cd $BACKEND_DIR
npm install
echo -e "${GREEN}✓ Backend dependencies updated${NC}"

echo -e "${YELLOW}Step 3: Restarting backend...${NC}"
pm2 restart lumitea-backend
echo -e "${GREEN}✓ Backend restarted${NC}"

echo -e "${YELLOW}Step 4: Building frontend...${NC}"
cd $APP_DIR/frontend-src
npm install
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"

echo -e "${YELLOW}Step 5: Copying frontend to nginx...${NC}"
cp -r dist/* $FRONTEND_DIR/dist/
echo -e "${GREEN}✓ Frontend deployed${NC}"

echo -e "${YELLOW}Step 6: Checking services...${NC}"
if pm2 status | grep -q "lumitea-backend"; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
    pm2 start $BACKEND_DIR/server.js --name lumitea-backend
fi

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
else
    echo -e "${RED}✗ Nginx is not running${NC}"
    systemctl start nginx
fi

echo ""
echo -e "${GREEN}==============================${NC}"
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${GREEN}==============================${NC}"
echo ""
echo "Website: https://lumitea.kr"
echo "Admin: https://lumitea.kr/admin"
echo ""
