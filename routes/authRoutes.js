const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, redirectIfAuth } = require('../middleware/auth');

// Login routes
router.get('/login', redirectIfAuth, authController.getLogin);
router.post('/login', redirectIfAuth, authController.postLogin);

// Register routes
router.get('/register', redirectIfAuth, authController.getRegister);
router.post('/register', redirectIfAuth, authController.postRegister);

// Logout
router.get('/logout', requireAuth, authController.logout);

module.exports = router;

