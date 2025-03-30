const express = require("express");
const router = express.Router();
const adminRoutes = require("./admin");
const appUserRoutes = require("./app/user");

// Combine all routes
router.use("/admin", adminRoutes);
router.use("/app/auth", appUserRoutes);

module.exports = router;
