const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Gmail SMTP configuration with App Password
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'lumitea.kr@gmail.com',
    pass: 'vslucdrfofunlxlx' // Gmail App Password (16 characters without spaces)
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// API: Send verification code
app.post('/api/send-verification', async (req, res) => {
  const { email, name, code } = req.body;
  
  try {
    const mailOptions = {
      from: '"Lumi Tea" <lumitea.kr@gmail.com>',
      to: email,
      subject: 'Lumi Tea - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e91e63;">Welcome to Lumi Tea!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with Lumi Tea. Please use the verification code below to complete your registration:</p>
          <div style="background: #f8f8f8; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; color: #e91e63; letter-spacing: 8px;">${code}</span>
          </div>
          <p>This code will expire in 30 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Lumi Tea<br>
            Incheon Yeonsu-gu Hambak-ro 12beon-gil 14<br>
            Phone: +82 10 2187 3643
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

// API: Send contact form
app.post('/api/send-contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  try {
    const mailOptions = {
      from: '"Lumi Tea Contact Form" <lumitea.kr@gmail.com>',
      to: 'lumitea.kr@gmail.com',
      replyTo: email,
      subject: `Lumi Tea Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e91e63;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 10px; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
});

// API: Subscribe to newsletter
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  
  try {
    const mailOptions = {
      from: '"Lumi Tea" <lumitea.kr@gmail.com>',
      to: email,
      subject: 'Welcome to Lumi Tea Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e91e63;">Thank You for Subscribing!</h2>
          <p>Welcome to the Lumi Tea family!</p>
          <p>You'll now receive:</p>
          <ul>
            <li>Exclusive offers and discounts</li>
            <li>New product announcements</li>
            <li>Tea brewing tips and guides</li>
            <li>Seasonal collections</li>
          </ul>
          <div style="background: #f8f8f8; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <p style="margin: 0;">Follow us on social media:</p>
            <p style="margin: 10px 0;">
              <a href="https://instagram.com/_lumi__tea_" style="color: #e91e63;">Instagram</a> | 
              <a href="https://t.me/lumi_chai" style="color: #e91e63;">Telegram</a>
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Lumi Tea<br>
            Incheon Yeonsu-gu Hambak-ro 12beon-gil 14<br>
            Phone: +82 10 2187 3643
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Subscription confirmed' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, message: 'Failed to subscribe', error: error.message });
  }
});

// API: Send chat conversation
app.post('/api/send-chat', async (req, res) => {
  const { email, messages, language } = req.body;
  
  const formatMessages = () => {
    return messages.map(m => `
      <div style="margin: 10px 0; padding: 10px; background: ${m.isUser ? '#e3f2fd' : '#f5f5f5'}; border-radius: 8px;">
        <strong>${m.isUser ? 'Customer' : 'Lumi Tea Assistant'}:</strong><br>
        ${m.text}
      </div>
    `).join('');
  };
  
  try {
    const mailOptions = {
      from: '"Lumi Tea Chat" <lumitea.kr@gmail.com>',
      to: 'lumitea.kr@gmail.com',
      subject: `Chat Support Request - ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e91e63;">Chat Support Request</h2>
          <p><strong>Customer Email:</strong> ${email}</p>
          <p><strong>Language:</strong> ${language}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <h3>Conversation:</h3>
          ${formatMessages()}
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Chat sent to support team' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, message: 'Failed to send chat', error: error.message });
  }
});

// API: Send password reset
app.post('/api/send-reset-code', async (req, res) => {
  const { email, code } = req.body;
  
  try {
    const mailOptions = {
      from: '"Lumi Tea" <lumitea.kr@gmail.com>',
      to: email,
      subject: 'Lumi Tea - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e91e63;">Password Reset Request</h2>
          <p>We received a request to reset your password.</p>
          <p>Please use the code below to reset your password:</p>
          <div style="background: #f8f8f8; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; color: #e91e63; letter-spacing: 8px;">${code}</span>
          </div>
          <p>This code will expire in 30 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Reset code sent' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, message: 'Failed to send reset code', error: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
