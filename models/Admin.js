const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  password_bcrypt: {
    type: String,
    required: true
  },
  password_argon2: {
    type: String,
    required: true
  },
  email: { 
    type: String, 
    default: '' 
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date
  }
}, {
  collection: 'admins' // Store in 'admins' collection
});

module.exports = mongoose.model('Admin', adminSchema);

