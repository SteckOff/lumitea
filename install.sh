#!/bin/bash

# Lumi Tea - Full Server Installation Script
# This script sets up the complete Lumi Tea server on Ubuntu/Debian
# Run as root: chmod +x install.sh && ./install.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="lumitea.kr"
EMAIL="lumitea.kr@gmail.com"
APP_DIR="/var/www/lumitea"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
DATA_DIR="$BACKEND_DIR/data"
LOG_DIR="$APP_DIR/logs"

# Print functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

print_header "Lumi Tea Server Installation"
print_info "Starting installation at $(date)"

# Update system
print_header "1. Updating System"
apt-get update && apt-get upgrade -y
print_success "System updated"

# Install essential packages
print_header "2. Installing Essential Packages"
apt-get install -y \
    curl \
    wget \
    git \
    nano \
    htop \
    ufw \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release
print_success "Essential packages installed"

# Install Node.js 20.x
print_header "3. Installing Node.js"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
print_success "Node.js $(node --version) installed"
print_success "npm $(npm --version) installed"

# Install PM2 globally
print_header "4. Installing PM2"
npm install -g pm2
print_success "PM2 installed"

# Install Nginx
print_header "5. Installing Nginx"
apt-get install -y nginx
systemctl enable nginx
print_success "Nginx installed and enabled"

# Install Certbot for SSL
print_header "6. Installing Certbot"
apt-get install -y certbot python3-certbot-nginx
print_success "Certbot installed"

# Create directories
print_header "7. Creating Directory Structure"
mkdir -p $APP_DIR $BACKEND_DIR $FRONTEND_DIR $DATA_DIR $LOG_DIR
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
print_success "Directories created"

# Setup Firewall
print_header "8. Configuring Firewall"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 3001/tcp
ufw --force enable
print_success "Firewall configured"

# Create backend package.json
print_header "9. Creating Backend Files"
cat > $BACKEND_DIR/package.json << 'EOF'
{
  "name": "lumitea-backend",
  "version": "1.0.0",
  "description": "Lumi Tea Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "nodemailer": "^6.9.7",
    "body-parser": "^1.20.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF
print_success "Backend package.json created"

# Create the main server.js file
cat > $BACKEND_DIR/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'lumi-tea-secret-key-2025';

// Data directory
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const VERIFICATION_CODES_FILE = path.join(DATA_DIR, 'verification-codes.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
        console.error('Error creating data directory:', err);
    }
}

// Initialize data files
async function initDataFiles() {
    const files = [USERS_FILE, ORDERS_FILE, PRODUCTS_FILE, VERIFICATION_CODES_FILE];
    for (const file of files) {
        try {
            await fs.access(file);
        } catch {
            await fs.writeFile(file, JSON.stringify([], null, 2));
        }
    }
}

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'lumitea.kr@gmail.com',
        pass: 'vslucdrfofunlxlx'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: ['https://lumitea.kr', 'https://www.lumitea.kr', 'http://localhost:5173'],
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many attempts, please try again later' }
});

// Generate verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
async function sendVerificationEmail(email, code) {
    const mailOptions = {
        from: 'Lumi Tea <lumitea.kr@gmail.com>',
        to: email,
        subject: 'Lumi Tea - Email Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #f9f9f9;">
                <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #4A6741; text-align: center; margin-bottom: 30px;">Lumi Tea</h1>
                    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Email Verification</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">
                        Thank you for registering with Lumi Tea! Please use the verification code below to complete your registration:
                    </p>
                    <div style="background: #4A6741; color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0; letter-spacing: 5px;">
                        ${code}
                    </div>
                    <p style="color: #999; font-size: 14px; text-align: center;">
                        This code will expire in 10 minutes.<br>
                        If you didn't request this, please ignore this email.
                    </p>
                </div>
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                    © 2025 Lumi Tea. All rights reserved.
                </p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        const user = users.find(u => u.id === decoded.userId);
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Send verification code
app.post('/api/auth/send-verification', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email required' });
        }

        const code = generateVerificationCode();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Save verification code
        let codes = [];
        try {
            codes = JSON.parse(await fs.readFile(VERIFICATION_CODES_FILE, 'utf8'));
        } catch {}
        
        // Remove old codes for this email
        codes = codes.filter(c => c.email !== email);
        codes.push({ email, code, expiresAt });
        await fs.writeFile(VERIFICATION_CODES_FILE, JSON.stringify(codes, null, 2));

        // Send email
        await sendVerificationEmail(email, code);
        
        res.json({ success: true, message: 'Verification code sent' });
    } catch (error) {
        console.error('Send verification error:', error);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
});

// Verify code and register
app.post('/api/auth/verify-and-register', authLimiter, async (req, res) => {
    try {
        const { email, code, password, name } = req.body;

        if (!email || !code || !password || !name) {
            return res.status(400).json({ error: 'All fields required' });
        }

        // Verify code
        let codes = [];
        try {
            codes = JSON.parse(await fs.readFile(VERIFICATION_CODES_FILE, 'utf8'));
        } catch {}

        const validCode = codes.find(c => 
            c.email === email && 
            c.code === code && 
            c.expiresAt > Date.now()
        );

        if (!validCode) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        // Check if user exists
        let users = [];
        try {
            users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        } catch {}

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: crypto.randomUUID(),
            email,
            name,
            password: hashedPassword,
            role: 'user',
            verified: true,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));

        // Remove used code
        codes = codes.filter(c => c.code !== code);
        await fs.writeFile(VERIFICATION_CODES_FILE, JSON.stringify(codes, null, 2));

        // Generate token
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        let users = [];
        try {
            users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        } catch {}

        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role
        }
    });
});

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        let users = [];
        try {
            users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        } catch {}
        
        // Remove passwords from response
        const safeUsers = users.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            verified: u.verified,
            createdAt: u.createdAt
        }));
        
        res.json({ users: safeUsers });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Update user role (admin only)
app.put('/api/admin/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        let users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        const userIndex = users.findIndex(u => u.id === id);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        users[userIndex].role = role;
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));

        res.json({ success: true, message: 'User role updated' });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// Delete user (admin only)
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        let users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        users = users.filter(u => u.id !== id);
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));

        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Products API

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        let products = [];
        try {
            products = JSON.parse(await fs.readFile(PRODUCTS_FILE, 'utf8'));
        } catch {}
        res.json({ products });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to get products' });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let products = [];
        try {
            products = JSON.parse(await fs.readFile(PRODUCTS_FILE, 'utf8'));
        } catch {}
        
        const product = products.find(p => p.id === id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to get product' });
    }
});

// Create product (admin only)
app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        let products = [];
        try {
            products = JSON.parse(await fs.readFile(PRODUCTS_FILE, 'utf8'));
        } catch {}

        const newProduct = {
            id: crypto.randomUUID(),
            name,
            description,
            price: parseFloat(price),
            category,
            image,
            stock: parseInt(stock) || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        products.push(newProduct);
        await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));

        res.json({ success: true, product: newProduct });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product (admin only)
app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        let products = JSON.parse(await fs.readFile(PRODUCTS_FILE, 'utf8'));
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        products[index] = { 
            ...products[index], 
            ...updates, 
            updatedAt: new Date().toISOString() 
        };
        await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));

        res.json({ success: true, product: products[index] });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product (admin only)
app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        let products = JSON.parse(await fs.readFile(PRODUCTS_FILE, 'utf8'));
        products = products.filter(p => p.id !== id);
        await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));

        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Orders API

// Get all orders (admin only)
app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
    try {
        let orders = [];
        try {
            orders = JSON.parse(await fs.readFile(ORDERS_FILE, 'utf8'));
        } catch {}
        res.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Get user orders
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        let orders = [];
        try {
            orders = JSON.parse(await fs.readFile(ORDERS_FILE, 'utf8'));
        } catch {}
        
        const userOrders = orders.filter(o => o.userId === req.user.id);
        res.json({ orders: userOrders });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Create order
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { items, total, shippingAddress, paymentMethod } = req.body;

        let orders = [];
        try {
            orders = JSON.parse(await fs.readFile(ORDERS_FILE, 'utf8'));
        } catch {}

        const newOrder = {
            id: crypto.randomUUID(),
            userId: req.user.id,
            userEmail: req.user.email,
            items,
            total: parseFloat(total),
            shippingAddress,
            paymentMethod,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        orders.push(newOrder);
        await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));

        res.json({ success: true, order: newOrder });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Update order status (admin only)
app.put('/api/admin/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        let orders = JSON.parse(await fs.readFile(ORDERS_FILE, 'utf8'));
        const index = orders.findIndex(o => o.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        orders[index].status = status;
        orders[index].updatedAt = new Date().toISOString();
        await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));

        res.json({ success: true, order: orders[index] });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// Initialize and start server
async function startServer() {
    await ensureDataDir();
    await initDataFiles();
    
    // Create default admin user if none exists
    let users = [];
    try {
        users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
    } catch {}
    
    if (!users.find(u => u.email === 'admin@lumitea.kr')) {
        const adminUser = {
            id: crypto.randomUUID(),
            email: 'admin@lumitea.kr',
            name: 'Administrator',
            password: await bcrypt.hash('LumiTea2025!', 10),
            role: 'admin',
            verified: true,
            createdAt: new Date().toISOString()
        };
        users.push(adminUser);
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        console.log('Default admin user created: admin@lumitea.kr / LumiTea2025!');
    }

    app.listen(PORT, () => {
        console.log(`Lumi Tea Server running on port ${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api`);
    });
}

startServer().catch(console.error);
EOF
print_success "Backend server.js created"

# Install backend dependencies
print_header "10. Installing Backend Dependencies"
cd $BACKEND_DIR
npm install
print_success "Backend dependencies installed"

# Create PM2 ecosystem file
print_header "11. Creating PM2 Configuration"
cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'lumitea-backend',
    script: '$BACKEND_DIR/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      JWT_SECRET: 'lumi-tea-secret-key-$(openssl rand -hex 16)'
    },
    log_file: '$LOG_DIR/combined.log',
    out_file: '$LOG_DIR/out.log',
    error_file: '$LOG_DIR/error.log',
    time: true
  }]
};
EOF
print_success "PM2 config created"

# Create Nginx configuration
print_header "12. Creating Nginx Configuration"
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
    ssl_trusted_certificate /etc/letsencrypt/live/lumitea.kr/chain.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Frontend static files
    location / {
        root /var/www/lumitea/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/lumitea/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/lumitea /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
print_success "Nginx configured"

# Create initial products data
print_header "13. Creating Initial Products"
cat > $PRODUCTS_FILE << 'EOF'
[
  {
    "id": "1",
    "name": "Sejak Green Tea",
    "description": "Premium Korean green tea harvested in early spring. Delicate, sweet flavor with a smooth finish.",
    "price": 35000,
    "category": "green",
    "image": "/images/teas/sejak.jpg",
    "stock": 50,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "2",
    "name": "Jungjak Green Tea",
    "description": "Medium-grade green tea with a balanced, slightly nutty flavor. Perfect for daily enjoyment.",
    "price": 28000,
    "category": "green",
    "image": "/images/teas/jungjak.jpg",
    "stock": 45,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "3",
    "name": "Daejak Green Tea",
    "description": "Late harvest green tea with a robust, earthy flavor. Great value for everyday drinking.",
    "price": 22000,
    "category": "green",
    "image": "/images/teas/daejak.jpg",
    "stock": 60,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "4",
    "name": "Hwangcha Yellow Tea",
    "description": "Rare Korean yellow tea with a unique mellow flavor and golden amber color.",
    "price": 42000,
    "category": "yellow",
    "image": "/images/teas/hwangcha.jpg",
    "stock": 30,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "5",
    "name": "Balhyocha Fermented Tea",
    "description": "Korean fermented tea with complex, wine-like notes. Smooth and naturally sweet.",
    "price": 38000,
    "category": "fermented",
    "image": "/images/teas/balhyocha.jpg",
    "stock": 35,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "6",
    "name": "Omija Berry Tea",
    "description": "Traditional five-flavor berry tea. Sweet, sour, salty, bitter, and spicy in one cup.",
    "price": 25000,
    "category": "herbal",
    "image": "/images/teas/omija.jpg",
    "stock": 40,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "7",
    "name": "Yuja Citrus Tea",
    "description": "Refreshing citron tea packed with vitamin C. Perfect for cold days.",
    "price": 23000,
    "category": "herbal",
    "image": "/images/teas/yuja.jpg",
    "stock": 55,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "8",
    "name": "Premium Gift Set",
    "description": "Elegant gift box containing 3 premium teas: Sejak, Hwangcha, and Balhyocha.",
    "price": 95000,
    "category": "gift",
    "image": "/images/teas/gift-set.jpg",
    "stock": 20,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
EOF
print_success "Initial products created"

# Create startup script
print_header "14. Creating Startup Script"
cat > $APP_DIR/start.sh << 'EOF'
#!/bin/bash
cd /var/www/lumitea
pm2 start ecosystem.config.js
pm2 save
EOF
chmod +x $APP_DIR/start.sh

# Create update script
print_header "15. Creating Update Script"
cat > $APP_DIR/update.sh << 'EOF'
#!/bin/bash
set -e

echo "Updating Lumi Tea Server..."

# Pull latest changes (if using git)
# cd /var/www/lumitea && git pull

# Update backend dependencies
cd /var/www/lumitea/backend
npm install

# Restart PM2
pm2 restart lumitea-backend

echo "Update complete!"
EOF
chmod +x $APP_DIR/update.sh

# Create backup script
print_header "16. Creating Backup Script"
cat > $APP_DIR/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/lumitea"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

tar -czf "$BACKUP_DIR/lumitea_backup_$DATE.tar.gz" /var/www/lumitea/data

# Keep only last 10 backups
ls -t $BACKUP_DIR/*.tar.gz | tail -n +11 | xargs rm -f

echo "Backup created: $BACKUP_DIR/lumitea_backup_$DATE.tar.gz"
EOF
chmod +x $APP_DIR/backup.sh

# Setup cron for daily backup
(crontab -l 2>/dev/null; echo "0 3 * * * /var/www/lumitea/backup.sh >> /var/log/lumitea-backup.log 2>&1") | crontab -
print_success "Daily backup scheduled"

# Set permissions
print_header "17. Setting Permissions"
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
chmod 600 $BACKEND_DIR/*.js 2>/dev/null || true
print_success "Permissions set"

# Start server with PM2
print_header "18. Starting Server"
cd $APP_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
print_success "Server started with PM2"

# Final summary
print_header "Installation Complete!"
echo ""
echo -e "${GREEN}✓ Lumi Tea server has been successfully installed!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Important Information:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Website:${NC} https://$DOMAIN"
echo -e "${GREEN}API:${NC} https://$DOMAIN/api"
echo -e "${GREEN}Admin Panel:${NC} https://$DOMAIN/admin"
echo ""
echo -e "${YELLOW}Default Admin Credentials:${NC}"
echo -e "  Email: ${GREEN}admin@lumitea.kr${NC}"
echo -e "  Password: ${GREEN}LumiTea2025!${NC}"
echo ""
echo -e "${YELLOW}Server Directories:${NC}"
echo -e "  App: ${GREEN}$APP_DIR${NC}"
echo -e "  Backend: ${GREEN}$BACKEND_DIR${NC}"
echo -e "  Frontend: ${GREEN}$FRONTEND_DIR${NC}"
echo -e "  Data: ${GREEN}$DATA_DIR${NC}"
echo -e "  Logs: ${GREEN}$LOG_DIR${NC}"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  Check status: ${GREEN}pm2 status${NC}"
echo -e "  View logs: ${GREEN}pm2 logs lumitea-backend${NC}"
echo -e "  Restart: ${GREEN}pm2 restart lumitea-backend${NC}"
echo -e "  Update: ${GREEN}/var/www/lumitea/update.sh${NC}"
echo -e "  Backup: ${GREEN}/var/www/lumitea/backup.sh${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
print_info "Next steps:"
echo "1. Build and upload your frontend to $FRONTEND_DIR/dist"
echo "2. Run: certbot --nginx -d lumitea.kr -d www.lumitea.kr"
echo "3. Update DNS to point to this server"
echo ""
print_info "Installation completed at $(date)"
