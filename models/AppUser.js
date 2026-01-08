const mongoose = require('mongoose');

// App User Schema (from app_users collection in Flask backend)
const appUserSchema = new mongoose.Schema({}, { 
  strict: false, 
  collection: 'app_users' // Same collection as Flask backend
});

module.exports = mongoose.model('AppUser', appUserSchema);

