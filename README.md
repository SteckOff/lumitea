# Lumi Tea - GitHub Repository

This is the complete source code for Lumi Tea e-commerce website.

## Repository Structure

```
lumi-tea-github/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions auto-deploy
├── backend/
│   ├── server.js               # Express.js backend
│   └── package.json            # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Register.tsx    # Registration with email verification
│   │   │   └── CheckoutPayment.tsx  # Payment component
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # Auth state management
│   │   ├── pages/
│   │   │   └── AdminPanel.tsx  # Admin dashboard
│   │   ├── api.ts              # API service
│   │   ├── App.tsx             # Main app component
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── index.html              # HTML template
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.ts          # Vite config
│   ├── tsconfig.json           # TypeScript config
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── postcss.config.js       # PostCSS config
├── deploy.sh                   # Server deployment script
└── README.md                   # This file
```

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/lumitea.git
cd lumitea
```

### 2. Setup Backend

```bash
cd backend
npm install
npm start
```

Backend will run on http://localhost:3001

### 3. Setup Frontend (Development)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173

## GitHub Setup

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `lumitea`
3. Make it private (recommended)
4. Click "Create repository"

### Step 2: Push Code to GitHub

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/lumitea.git

# Push
git push -u origin main
```

### Step 3: Add GitHub Secrets (for auto-deploy)

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `SERVER_HOST` | 158.247.225.4 |
| `SERVER_USER` | root |
| `SERVER_PASSWORD` | Your server password |

## Server Setup

### Step 1: Initial Server Setup

SSH into your server:

```bash
ssh root@158.247.225.4
```

### Step 2: Clone Repository on Server

```bash
cd /var/www
rm -rf lumitea  # Remove old if exists

# Clone your repository
git clone https://github.com/YOUR_USERNAME/lumitea.git

# Or use SSH (recommended for private repos)
git clone git@github.com:YOUR_USERNAME/lumitea.git
```

### Step 3: Run Installation

```bash
cd lumitea
chmod +x deploy.sh
./deploy.sh
```

Or run the full install script:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/lumitea/main/install.sh | sudo bash
```

### Step 4: Setup GitHub Webhook (Optional - for instant deploy)

On your server:

```bash
# Install webhook
apt-get install webhook

# Create webhook config
cat > /etc/webhook.conf << 'EOF'
[
  {
    "id": "deploy-lumitea",
    "execute-command": "/var/www/lumitea/deploy.sh",
    "command-working-directory": "/var/www/lumitea",
    "response-message": "Deploying...",
    "trigger-rule": {
      "and": [
        {
          "match": {
            "type": "payload-hmac-sha256",
            "secret": "YOUR_WEBHOOK_SECRET",
            "parameter": {
              "source": "header",
              "name": "X-Hub-Signature-256"
            }
          }
        }
      ]
    }
  }
]
EOF

# Start webhook
webhook -hooks /etc/webhook.conf -port 9000 &
```

Then add webhook in GitHub:
1. Go to repository Settings → Webhooks
2. Add webhook
3. Payload URL: `http://158.247.225.4:9000/hooks/deploy-lumitea`
4. Content type: `application/json`
5. Secret: Your webhook secret
6. Events: Just the push event

## How Auto-Deploy Works

### Option 1: GitHub Actions (Recommended)

When you push to `main` branch:

1. GitHub Actions automatically builds frontend
2. Deploys frontend files to server via SCP
3. SSH into server and restarts backend
4. Takes ~2-3 minutes

### Option 2: Manual Deploy

On your server:

```bash
cd /var/www/lumitea
./deploy.sh
```

### Option 3: GitHub Webhook (Instant)

When you push to GitHub:

1. GitHub sends webhook to your server
2. Server runs deploy.sh automatically
3. Instant deployment

## Development Workflow

### Making Changes

1. **Local development:**
```bash
cd frontend
npm run dev
# Make changes, test locally
```

2. **Commit and push:**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

3. **Auto-deploy happens automatically!**

### Updating Backend Only

```bash
# SSH to server
ssh root@158.247.225.4

# Pull latest
cd /var/www/lumitea
git pull

# Restart backend
pm2 restart lumitea-backend
```

### Updating Frontend Only

```bash
# SSH to server
ssh root@158.247.225.4

# Build and deploy
cd /var/www/lumitea/frontend-src
npm install
npm run build
cp -r dist/* /var/www/lumitea/frontend/dist/
```

## Environment Variables

### Frontend (.env file)

```
VITE_API_URL=https://lumitea.kr/api
```

### Backend (environment variables)

```bash
export NODE_ENV=production
export PORT=3001
export JWT_SECRET=your-secret-key
```

## Troubleshooting

### GitHub Actions failing

Check secrets are set correctly:
- Go to Settings → Secrets and variables → Actions
- Verify SERVER_HOST, SERVER_USER, SERVER_PASSWORD

### Server not updating

```bash
# Check if git pull works
ssh root@158.247.225.4
cd /var/www/lumitea
git status
git pull
```

### Backend not restarting

```bash
ssh root@158.247.225.4
pm2 logs lumitea-backend
pm2 restart lumitea-backend
```

### Frontend not updating

```bash
ssh root@158.247.225.4
nginx -t
systemctl reload nginx
```

## Security Notes

1. **Never commit secrets to GitHub!**
2. Use GitHub Secrets for sensitive data
3. Keep your server password secure
4. Use SSH keys instead of password (recommended)
5. Enable 2FA on GitHub

## Useful Commands

```bash
# Check deployment status
ssh root@158.247.225.4 "pm2 status"

# View logs
ssh root@158.247.225.4 "pm2 logs lumitea-backend --lines 50"

# Manual deploy
ssh root@158.247.225.4 "cd /var/www/lumitea && ./deploy.sh"

# Check git status on server
ssh root@158.247.225.4 "cd /var/www/lumitea && git status"
```

## Support

- Email: lumitea.kr@gmail.com
- KakaoTalk: @_lumi__tea_
- Instagram: @lumi.tea.kr
