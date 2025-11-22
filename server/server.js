// ⚠️  PROTOTYPE ONLY - DO NOT USE WITH REAL PHI ⚠️
// This is a healthcare prototype for demonstration purposes only.
// NOT suitable for production use with real patient data.

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { initDatabase } from './database/connection.js';
import { setupRoutes } from './routes/index.js';
import { setupSocketHandlers } from './socket/handlers.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupCron } from './services/cronService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for development
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for attachments
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Add socket.io to request context
app.use((req, res, next) => {
  req.io = io;
  next();
});

async function startServer() {
  try {
    console.log('🔧 Starting server initialization...');
    console.log('📍 PORT:', PORT);
    console.log('📍 NODE_ENV:', process.env.NODE_ENV);
    
    // Initialize database
    console.log('🔧 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized');
    console.log('🔧 Setting up routes...');

    // Setup routes
    setupRoutes(app);
    console.log('✅ Routes configured');
    console.log('🔧 Setting up Socket.io...');

    // Setup Socket.io handlers
    setupSocketHandlers(io);
    console.log('✅ Socket.io handlers configured');
    console.log('🔧 Setting up cron jobs...');

    // Setup cron jobs for reminders
    setupCron();
    console.log('✅ Cron jobs scheduled');
    console.log('🔧 Adding error handler middleware...');

    // Error handling middleware (must be last)
    app.use(errorHandler);
    console.log('✅ Error handler configured');
    console.log('🔧 Starting server listener...');

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🏥 IntelliHealth Backend running on port ${PORT}`);
      console.log(`⚠️  PROTOTYPE ONLY - DO NOT USE WITH REAL PHI`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('❌ Error stack:', error.stack);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();