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
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: DB_NAME
    });
    console.log('✅ Connected to MongoDB');
    console.log(`   Database: ${DB_NAME}`);
    console.log(`   Collections: app_users, discord_links, expert_moves, payments`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

