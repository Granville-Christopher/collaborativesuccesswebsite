// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect('/login');
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

