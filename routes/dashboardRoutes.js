const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const analyticsController = require('../controllers/analyticsController');
const { requireAuth } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', requireAuth, dashboardController.getDashboard);

// API endpoints
router.get('/api/users', requireAuth, dashboardController.getUsersAPI);
router.get('/api/analytics/downloads', requireAuth, analyticsController.getDownloadStats);
router.get('/api/analytics/user-growth', requireAuth, analyticsController.getUserGrowthStats);
router.get('/api/analytics/tier-distribution', requireAuth, analyticsController.getTierDistribution);
router.get('/api/analytics/revenue', requireAuth, analyticsController.getRevenueStats);
router.get('/api/analytics/expired', requireAuth, analyticsController.getExpiredStats);
router.get('/api/analytics/linked-accounts', requireAuth, analyticsController.getLinkedAccountsStats);
router.get('/api/analytics/dashboard-stats', requireAuth, analyticsController.getDashboardStats);
router.get('/api/analytics/revenue-chart', requireAuth, analyticsController.getRevenueChart);

module.exports = router;

