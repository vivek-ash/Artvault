const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const artworkRoutes = require('./routes/artwork.routes');
const orderRoutes = require('./routes/order.routes');
const notificationRoutes = require('./routes/notification.routes');
const commissionRoutes = require('./routes/commission.routes');
const adminRoutes = require('./routes/admin.routes');
const wishlistRoutes = require('./routes/wishlist.routes');

// Connect to database
connectDB();

const app = express();

// --------------- Middleware ---------------

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security headers
app.use(helmet());

// Sanitize data — prevent NoSQL injection
app.use(mongoSanitize());

// Rate limiting — 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: {
    success: false,
    error: 'Too many requests, please try again after 15 minutes.',
  },
});
app.use('/api', limiter);

// --------------- Routes ---------------

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ArtVault API is running',
  });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Error handler (must be after routes)
app.use(errorHandler);

// --------------- Server & Socket.io ---------------

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store io instance on app so controllers can access it
app.set('io', io);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins their own room for targeted notifications
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// --------------- Start Server ---------------

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
