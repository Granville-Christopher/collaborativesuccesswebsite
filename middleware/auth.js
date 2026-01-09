// Middleware to check if user is authenticated
const requireAuth = async (req, res, next) => {
  if (!req.session.admin) {
    return res.redirect('/login');
  }
  
  // Verify admin still exists in database (security check)
  try {
    const Admin = require('../models/Admin');
    const admin = await Admin.findById(req.session.admin.id);
    if (!admin) {
      // Admin was deleted, destroy session
      req.session.destroy();
      return res.redirect('/login?error=admin_not_found');
    }
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.session.destroy();
    res.redirect('/login?error=auth_error');
  }
};

// Middleware to redirect if already logged in
const redirectIfAuth = (req, res, next) => {
  if (req.session.admin) {
    res.redirect('/dashboard');
  } else {
    next();
  }
};

module.exports = {
  requireAuth,
  redirectIfAuth
};

