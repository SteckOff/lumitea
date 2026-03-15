const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'dist')));

// Data directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Data files
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

// Initialize data files
function initDataFile(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

initDataFile(USERS_FILE, []);
initDataFile(ORDERS_FILE, []);
initDataFile(SUBSCRIBERS_FILE, []);

// Default products
const defaultProducts = {
  teas: [
    { id: 1, name: { en: "Korean Green Tea", ko: "한국 녹차", ru: "Корейский зеленый чай" }, price: 15000, originalPrice: 18000, image: "/tea_collection.jpg", category: "green", rating: 4.8, reviews: 128, badge: { en: "Bestseller", ko: "베스트셀러", ru: "Хит продаж" }, description: { en: "Premium green tea from Jeju Island", ko: "제주도 프리미엄 녹차", ru: "Премиальный зеленый чай с острова Чеджу" } },
    { id: 2, name: { en: "Omija Tea", ko: "오미자차", ru: "Чай Омиджа" }, price: 18000, originalPrice: 22000, image: "/tea_set.jpg", category: "fruit", rating: 4.9, reviews: 96, badge: { en: "New", ko: "신제품", ru: "Новинка" }, description: { en: "Traditional five-flavor berry tea", ko: "전통 오미자차", ru: "Традиционный чай из ягод пяти вкусов" } },
    { id: 3, name: { en: "Jujube Tea", ko: "대추차", ru: "Чай из фиников" }, price: 12000, originalPrice: 15000, image: "/tea_collection.jpg", category: "herbal", rating: 4.7, reviews: 84, description: { en: "Sweet and nourishing jujube tea", ko: "달콤하고 영양가 있는 대추차", ru: "Сладкий и питательный чай из фиников" } },
    { id: 4, name: { en: "Korean Black Tea", ko: "한국 홍차", ru: "Корейский черный чай" }, price: 16000, originalPrice: 20000, image: "/tea_set.jpg", category: "black", rating: 4.6, reviews: 72, description: { en: "Rich and aromatic black tea", ko: "풍부하고 향긋한 홍차", ru: "Насыщенный и ароматный черный чай" } },
    { id: 5, name: { en: "Chrysanthemum Tea", ko: "국화차", ru: "Чай из хризантем" }, price: 14000, originalPrice: 17000, image: "/tea_collection.jpg", category: "herbal", rating: 4.8, reviews: 103, description: { en: "Fragrant chrysanthemum tea", ko: "향긋한 국화차", ru: "Ароматный чай из хризантем" } },
    { id: 6, name: { en: "Plum Tea", ko: "매실차", ru: "Чай из сливы" }, price: 13000, originalPrice: 16000, image: "/tea_set.jpg", category: "fruit", rating: 4.7, reviews: 89, description: { en: "Refreshing plum tea", ko: "상쾌한 매실차", ru: "Освежающий чай из сливы" } }
  ],
  giftSets: [
    { id: 101, name: { en: "Premium Tea Collection", ko: "프리미엄 차 컬렉션", ru: "Премиальная коллекция чая" }, price: 45000, originalPrice: 55000, image: "/tea_collection.jpg", rating: 4.9, reviews: 156, badge: { en: "Popular", ko: "인기", ru: "Популярное" }, description: { en: "Curated selection of our finest teas", ko: "엄선된 최고급 차", ru: "Подборка наших лучших чаев" }, items: ["3 premium teas", "Beautiful gift box", "Tea infuser", "Brewing guide"] },
    { id: 102, name: { en: "Tea Lover's Set", ko: "차 애호가 세트", ru: "Набор для любителей чая" }, price: 32000, originalPrice: 40000, image: "/tea_set.jpg", category: "beginner", rating: 4.8, reviews: 124, description: { en: "Perfect starter set for tea enthusiasts", ko: "차 애호가를 위한 완벽한 스타터 세트", ru: "Идеальный стартовый набор для любителей чая" }, items: ["2 signature teas", "Glass teacup", "Tea scoop"] },
    { id: 103, name: { en: "Wellness Tea Set", ko: "웰니스 차 세트", ru: "Набор чая для здоровья" }, price: 38000, originalPrice: 48000, image: "/tea_collection.jpg", category: "wellness", rating: 4.7, reviews: 98, badge: { en: "Trending", ko: "트렌딩", ru: "В тренде" }, description: { en: "Health-focused tea collection", ko: "건강 중심 차 컬렉션", ru: "Коллекция чая для здоровья" }, items: ["4 wellness teas", "Tea timer", "Wellness guide"] },
    { id: 104, name: { en: "Luxury Gift Box", ko: "럭셔리 선물 상자", ru: "Подарочная коробка люкс" }, price: 68000, originalPrice: 85000, image: "/tea_set.jpg", category: "luxury", rating: 5.0, reviews: 87, badge: { en: "Premium", ko: "프리미엄", ru: "Премиум" }, description: { en: "Ultimate luxury tea experience", ko: "궁극의 럭셔리 차 경험", ru: "Максимальный роскошный чайный опыт" }, items: ["4 rare teas", "Handcrafted teapot", "Premium gift box", "Personalized card"] }
  ]
};

initDataFile(PRODUCTS_FILE, defaultProducts);

// Helper functions
function readData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

function generateOrderId() {
  return 'ORD-' + Date.now().toString(36).toUpperCase();
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'lumitea.kr@gmail.com',
    pass: 'vslucdrfofunlxlx'
  }
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// ==================== AUTH API ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  const users = readData(USERS_FILE);
  
  // Check if user exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  
  const verificationCode = generateVerificationCode();
  
  const newUser = {
    id: generateId(),
    name,
    email,
    password,
    phone,
    isVerified: false,
    verificationCode,
    addresses: [],
    isAdmin: false,
    createdAt: new Date().toISOString()
  };
  
  // Send verification email
  try {
    await transporter.sendMail({
      from: '"Lumi Tea" <lumitea.kr@gmail.com>',
      to: email,
      subject: 'Lumi Tea - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e91e63;">Welcome to Lumi Tea!</h2>
          <p>Hello ${name},</p>
          <p>Your verification code:</p>
          <div style="background: #f8f8f8; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; color: #e91e63; letter-spacing: 8px;">${verificationCode}</span>
          </div>
          <p>This code will expire in 30 minutes.</p>
        </div>
      `
    });
    
    users.push(newUser);
    writeData(USERS_FILE, users);
    
    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send verification email' });
  }
});

// Verify email
app.post('/api/auth/verify', (req, res) => {
  const { email, code } = req.body;
  
  const users = readData(USERS_FILE);
  const userIndex = users.findIndex(u => u.email === email && u.verificationCode === code);
  
  if (userIndex === -1) {
    return res.status(400).json({ success: false, message: 'Invalid verification code' });
  }
  
  users[userIndex].isVerified = true;
  users[userIndex].verificationCode = null;
  writeData(USERS_FILE, users);
  
  const { password, ...userWithoutPassword } = users[userIndex];
  res.json({ success: true, message: 'Email verified', user: userWithoutPassword });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Admin login
  if (email === 'admin@lumitea.kr' && password === 'LumiTea2025!') {
    return res.json({
      success: true,
      user: {
        id: 'admin',
        name: 'Admin',
        email: 'admin@lumitea.kr',
        isAdmin: true,
        isVerified: true
      }
    });
  }
  
  const users = readData(USERS_FILE);
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid credentials' });
  }
  
  if (!user.isVerified) {
    return res.status(400).json({ success: false, message: 'Email not verified', needsVerification: true });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

// Resend verification
app.post('/api/auth/resend-verification', async (req, res) => {
  const { email } = req.body;
  
  const users = readData(USERS_FILE);
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    return res.status(400).json({ success: false, message: 'User not found' });
  }
  
  const newCode = generateVerificationCode();
  users[userIndex].verificationCode = newCode;
  writeData(USERS_FILE, users);
  
  try {
    await transporter.sendMail({
      from: '"Lumi Tea" <lumitea.kr@gmail.com>',
      to: email,
      subject: 'Lumi Tea - New Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e91e63;">New Verification Code</h2>
          <p>Your new verification code:</p>
          <div style="background: #f8f8f8; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; color: #e91e63; letter-spacing: 8px;">${newCode}</span>
          </div>
        </div>
      `
    });
    
    res.json({ success: true, message: 'New code sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

// ==================== PRODUCTS API ====================

// Get all products
app.get('/api/products', (req, res) => {
  const products = readData(PRODUCTS_FILE);
  res.json(products);
});

// Update products (admin only)
app.post('/api/products', (req, res) => {
  const { teas, giftSets } = req.body;
  writeData(PRODUCTS_FILE, { teas, giftSets });
  res.json({ success: true, message: 'Products updated' });
});

// ==================== ORDERS API ====================

// Create order
app.post('/api/orders', async (req, res) => {
  const { userId, userEmail, userName, items, address, subtotal, shipping, total, paymentMethod } = req.body;
  
  const orders = readData(ORDERS_FILE);
  
  const newOrder = {
    orderId: generateOrderId(),
    userId,
    userEmail,
    userName,
    items,
    address,
    subtotal,
    shipping,
    total,
    paymentMethod: paymentMethod || 'manual',
    status: 'pending',
    createdAt: new Date().toISOString(),
    printed: false
  };
  
  orders.push(newOrder);
  writeData(ORDERS_FILE, orders);
  
  // Send order confirmation email
  try {
    await transporter.sendMail({
      from: '"Lumi Tea" <lumitea.kr@gmail.com>',
      to: userEmail,
      subject: `Lumi Tea - Order Confirmation #${newOrder.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e91e63;">Order Confirmation</h2>
          <p>Thank you for your order, ${userName}!</p>
          <p><strong>Order ID:</strong> ${newOrder.orderId}</p>
          <p><strong>Total:</strong> ₩${total.toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod === 'manual' ? 'Contact Manager' : 'Card'}</p>
          <p>We will contact you soon to confirm your order.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email error:', error);
  }
  
  res.json({ success: true, order: newOrder });
});

// Get all orders (admin)
app.get('/api/orders', (req, res) => {
  const orders = readData(ORDERS_FILE);
  res.json(orders);
});

// Get user orders
app.get('/api/orders/user/:userId', (req, res) => {
  const { userId } = req.params;
  const orders = readData(ORDERS_FILE);
  const userOrders = orders.filter(o => o.userId === userId);
  res.json(userOrders);
});

// Update order status
app.put('/api/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  const orders = readData(ORDERS_FILE);
  const orderIndex = orders.findIndex(o => o.orderId === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  
  orders[orderIndex].status = status;
  writeData(ORDERS_FILE, orders);
  
  res.json({ success: true, message: 'Status updated' });
});

// Mark order as printed
app.put('/api/orders/:orderId/printed', (req, res) => {
  const { orderId } = req.params;
  
  const orders = readData(ORDERS_FILE);
  const orderIndex = orders.findIndex(o => o.orderId === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  
  orders[orderIndex].printed = true;
  writeData(ORDERS_FILE, orders);
  
  res.json({ success: true, message: 'Order marked as printed' });
});

// ==================== SUBSCRIBERS API ====================

// Add subscriber
app.post('/api/subscribers', (req, res) => {
  const { email } = req.body;
  
  const subscribers = readData(SUBSCRIBERS_FILE);
  
  if (subscribers.find(s => s.email === email)) {
    return res.status(400).json({ success: false, message: 'Already subscribed' });
  }
  
  subscribers.push({ email, subscribedAt: new Date().toISOString() });
  writeData(SUBSCRIBERS_FILE, subscribers);
  
  res.json({ success: true, message: 'Subscribed successfully' });
});

// Get all subscribers (admin)
app.get('/api/subscribers', (req, res) => {
  const subscribers = readData(SUBSCRIBERS_FILE);
  res.json(subscribers);
});

// ==================== EMAIL API ====================

// Contact form
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  try {
    await transporter.sendMail({
      from: '"Lumi Tea Contact" <lumitea.kr@gmail.com>',
      to: 'lumitea.kr@gmail.com',
      replyTo: email,
      subject: `Contact: ${subject}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`
    });
    
    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send' });
  }
});

// ==================== FRONTEND ====================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
});
