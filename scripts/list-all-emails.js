#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DB_NAME = 'CollaborativeSuccess';

const appUserSchema = new mongoose.Schema({}, { 
  strict: false, 
  collection: 'app_users'
});
const AppUser = mongoose.model('AppUser', appUserSchema);

async function listEmails() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    
    const users = await AppUser.find({}).lean();
    const emails = users
      .filter(u => u.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email.trim()))
      .map(u => u.email.trim());
    
    console.log('\n' + '='.repeat(60));
    console.log('📧 ALL EMAILS IN DATABASE');
    console.log('='.repeat(60) + '\n');
    
    emails.forEach((email, i) => {
      console.log(`${(i + 1).toString().padStart(2, ' ')}. ${email}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${emails.length} email(s)`);
    console.log('='.repeat(60));
    
    // Also output as comma-separated for easy copy-paste
    console.log('\n📋 Comma-separated list (for email BCC):');
    console.log(emails.join(', '));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listEmails();

