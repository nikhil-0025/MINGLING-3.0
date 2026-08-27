/**
 * Mingling Primary Backend Server
 * (server.js)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');

const connectDB = require('./src/config/database');
const initializeSockets = require('./src/sockets/socketHandler');

const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { sanitizeInput } = require('./src/middleware/validation');
const { runCleanupJob } = require('./src/utils/cleanup');

// Import Routes
const sessionRoutes = require('./src/routes/sessionRoutes');
const roomRoutes = require('./src/routes/roomRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});
app.set('io', io);

// Connect Databases
connectDB();

// Middleware Pipeline
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[DB MID WARN]', err.message);
  }
  next();
});

app.use(helmet({
  contentSecurityPolicy: false // Disabled for CDN font/icon compatibility
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);

// Apply Rate Limiter to API routes
app.use('/api', apiLimiter);

// Register API Routes
app.use('/api/session', sessionRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Serve Frontend Static Assets
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize Real-time Sockets
initializeSockets(io);

// Periodic cleanup timer every 30 minutes
setInterval(runCleanupJob, 30 * 60 * 1000);

if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 MINGLING REAL-TIME MESSAGING SERVER RUNNING ON PORT ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
