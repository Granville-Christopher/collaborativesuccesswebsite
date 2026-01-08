const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

// User edit
router.get('/user/:id', requireAuth, userController.getUserEdit);
router.post('/user/:id/update', requireAuth, userController.updateUser);

module.exports = router;

