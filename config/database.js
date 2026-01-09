const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection (uses same MONGO_URI as discord-bot Flask backend)
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  console.error('   Please set MONGO_URI in your .env file');
  process.exit(1);
}

// Database name from Flask backend: "CollaborativeSuccess"
const DB_NAME = 'CollaborativeSuccess';

// Collection names from Flask backend:
// - app_users
// - discord_links
// - expert_moves
// - payments

const connectDB = async () => {
  try {
    // Remove deprecated options (they're default in Mongoose 6+)
    await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME
    });
    console.log('✅ Connected to MongoDB');
    console.log(`   Database: ${DB_NAME}`);
    console.log(`   Collections: app_users, discord_links, expert_moves, payments, admins`);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error; // Don't exit, let server handle it
  }
};

module.exports = connectDB;

