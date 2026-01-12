const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

// Import routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const downloadRoutes = require('./routes/downloadRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB (will be called, but don't block server startup)
let dbConnected = false;
connectDB()
  .then(() => {
    dbConnected = true;
  })
  .catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.log('⚠️  Server will continue but database operations may fail');
  });

// Trust proxy for Railway (needed for HTTPS detection)
app.set('trust proxy', 1);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration with MongoDB store (production-ready)
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

// Create MongoDB session store with error handling (connect-mongo v4 API)
let sessionStore = undefined;
if (mongoUri) {
  try {
    sessionStore = new MongoStore({
      mongoUrl: mongoUri,
      dbName: 'CollaborativeSuccess',
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 24 hours in seconds
      autoRemove: 'native', // Use native MongoDB TTL index
      touchAfter: 24 * 3600 // Only update session once per day
    });
    console.log('✅ MongoDB session store initialized');
  } catch (error) {
    console.error('❌ Failed to create MongoDB session store:', error.message);
    console.warn('⚠️  Falling back to MemoryStore (not recommended for production)');
    sessionStore = undefined;
  }
} else {
  console.warn('⚠️  WARNING: No MONGO_URI found. Using MemoryStore for sessions.');
  if (isProduction) {
    console.warn('⚠️  MemoryStore is NOT recommended for production. Please set MONGO_URI environment variable.');
  }
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  store: sessionStore, // Will be undefined if MongoDB store creation failed, falling back to MemoryStore
  cookie: { 
    secure: isProduction, // Use secure cookies in production (Railway provides HTTPS)
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // CSRF protection
  }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime()
  });
});

// Routes (define before static files to avoid conflicts)
app.get('/', (req, res) => {
  res.redirect('/download');
});

app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', userRoutes);
app.use('/', downloadRoutes);

// Static files (after routes to avoid conflicts)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Debug route to check if static files are being served
app.get('/debug/files', (req, res) => {
  const fs = require('fs');
  const downloadsPath = path.join(publicPath, 'downloads');
  try {
    const files = fs.readdirSync(downloadsPath);
    res.json({
      publicPath: publicPath,
      downloadsPath: downloadsPath,
      files: files,
      fileExists: {
        'collaborativesuccess.apk': fs.existsSync(path.join(downloadsPath, 'collaborativesuccess.apk')),
        'app-release.apk': fs.existsSync(path.join(downloadsPath, 'app-release.apk'))
      }
    });
  } catch (err) {
    res.json({ error: err.message, publicPath, downloadsPath });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('error', { error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { error: 'Page not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Admin Panel running on http://localhost:${PORT}`);
  console.log(`🔐 Login at: http://localhost:${PORT}/login`);
  
  // Check admin count after a short delay to ensure DB is connected
  setTimeout(async () => {
    try {
      // Wait for connection to be ready
      if (mongoose.connection.readyState === 1) {
        const Admin = require('./models/Admin');
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
          console.log(`📱 Register at: http://localhost:${PORT}/register (First-time setup)`);
          console.log(`⚠️  No admin account found. Please register to create the first admin.`);
        } else {
          console.log(`✅ Admin account exists. Registration is disabled.`);
        }
      } else {
        console.log(`⚠️  Database not connected yet. Admin check will happen on first request.`);
      }
    } catch (error) {
      console.error('❌ Error checking admin count:', error.message);
    }
  }, 2000); // Wait 2 seconds for DB connection
  
  console.log(`\n📋 Database: CollaborativeSuccess`);
  console.log(`📦 Collections: app_users, discord_links, expert_moves, payments, admins`);
  console.log(`\n💡 Connection string from: MONGO_URI in .env file`);
  console.log(`\n🔒 Security: Only ONE admin account is allowed.`);
});
