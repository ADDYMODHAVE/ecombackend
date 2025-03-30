const express = require('express');
const router = express.Router();
const adminRoutes = require('./admin');

// Combine all routes
router.use('/admin', adminRoutes);

module.exports = router; 