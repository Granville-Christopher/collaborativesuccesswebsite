const Admin = require('../models/Admin');
const { hashPassword, verifyPassword } = require('../utils/password');

/**
 * Render login page
 */
const getLogin = async (req, res) => {
  try {
    // Check if admin exists to hide register link
    const adminCount = await Admin.countDocuments();
    res.render('login', { 
      error: req.query.error || null,
      showRegister: adminCount === 0 // Only show register if no admin exists
    });
  } catch (error) {
    console.error('Error checking admin count:', error);
    // If database error, show register link (safer default)
    res.render('login', { 
      error: req.query.error || null,
      showRegister: true
    });
  }
};

/**
 * Handle login
 */
const postLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.render('login', { error: 'Phone number and password are required' });
    }
    
    // Find admin by phone number
    const admin = await Admin.findOne({ phone: phone.trim() });
    
    if (!admin) {
      return res.render('login', { error: 'Invalid phone number or password' });
    }
    
    // Verify password with both bcrypt and argon2
    const isValid = await verifyPassword(
      password, 
      admin.password_bcrypt, 
      admin.password_argon2
    );
    
    if (!isValid) {
      return res.render('login', { error: 'Invalid phone number or password' });
    }
    
    // Update last login
    admin.last_login = new Date();
    await admin.save();
    
    // Set session
    req.session.admin = {
      id: admin._id.toString(),
      phone: admin.phone,
      email: admin.email || ''
    };
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'Login failed. Please try again.' });
  }
};

/**
 * Render register page - DISABLED: Only one admin allowed
 */
const getRegister = async (req, res) => {
  try {
    // Check if admin already exists
    const count = await Admin.countDocuments();
    if (count > 0) {
      return res.render('error', { 
        error: 'Admin registration is disabled. An admin account already exists. Please contact the system administrator.' 
      });
    }
    res.render('register', { error: null });
  } catch (err) {
    console.error('Error checking admin count:', err);
    res.render('error', { error: 'Unable to check admin status. Please try again later.' });
  }
};

/**
 * Handle registration - Only allows one admin
 */
const postRegister = async (req, res) => {
  try {
    // FIRST CHECK: Only allow registration if no admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.render('register', { 
        error: 'Admin registration is disabled. An admin account already exists. Only one admin is allowed.' 
      });
    }
    
    const { phone, password, confirmPassword, email } = req.body;
    
    // Validation
    if (!phone || !password) {
      return res.render('register', { error: 'Phone number and password are required' });
    }
    
    if (password.length < 8) {
      return res.render('register', { error: 'Password must be at least 8 characters' });
    }
    
    if (password !== confirmPassword) {
      return res.render('register', { error: 'Passwords do not match' });
    }
    
    // Double-check if admin already exists (race condition protection)
    const existingAdmin = await Admin.findOne({ phone: phone.trim() });
    if (existingAdmin) {
      return res.render('register', { error: 'Phone number already registered' });
    }
    
    // Hash password with both bcrypt and argon2
    const { bcrypt: bcryptHash, argon2: argon2Hash } = await hashPassword(password);
    
    // Create admin (only one allowed)
    const admin = await Admin.create({
      phone: phone.trim(),
      password: 'hashed', // Legacy field (not used, but kept for compatibility)
      password_bcrypt: bcryptHash,
      password_argon2: argon2Hash,
      email: email ? email.trim() : '',
      created_at: new Date()
    });
    
    console.log(`✅ Admin account created: ${admin.phone} (ONLY ADMIN ALLOWED)`);
    
    // Auto-login after registration
    req.session.admin = {
      id: admin._id.toString(),
      phone: admin.phone,
      email: admin.email || ''
    };
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      res.render('register', { error: 'Phone number already registered' });
    } else {
      res.render('register', { error: 'Registration failed. Please try again.' });
    }
  }
};

/**
 * Handle logout
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
};

module.exports = {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout
};

