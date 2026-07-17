// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import museumRoutes from './routes/museumRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import supportTicketRoutes from './routes/supportTicketRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';

// Verify critical environment variables
console.log('📋 Environment variables check:');
console.log('  STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Loaded' : '⚠️ Missing');
console.log('  MONGO_URI:', process.env.MONGO_URI ? '✅ Loaded' : '❌ Missing');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log(
  '  GEMINI_API_KEY:',
  process.env.GEMINI_API_KEY
    ? process.env.GEMINI_API_KEY.length > 0
      ? '✅ Loaded'
      : '⚠️ Empty'
    : '⚠️ Missing'
);
console.log(
  '  EMAIL_USER:',
  process.env.EMAIL_USER ? '✅ Loaded' : '⚠️ Missing (emails will be skipped)'
);
console.log(
  '  EMAIL_PASS:',
  process.env.EMAIL_PASS ? '✅ Loaded' : '⚠️ Missing (emails will be skipped)'
);

// Critical checks
if (!process.env.MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI is required');
}

if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET is required');
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ WARNING: STRIPE_SECRET_KEY missing. Payments will not work.');
}

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
  console.warn('⚠️ WARNING: GEMINI_API_KEY missing. Chatbot AI features will not work.');
}

// Connect database
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/museums', museumRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tickets', ticketRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});