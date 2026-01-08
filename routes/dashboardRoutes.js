const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', requireAuth, dashboardController.getDashboard);

// API endpoint
router.get('/api/users', requireAuth, dashboardController.getUsersAPI);

module.exports = router;

