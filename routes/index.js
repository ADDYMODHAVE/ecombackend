const express = require("express");
const router = express.Router();
const adminRoutes = require("./dashboard/admin");
const appUserRoutes = require("./app/user");
const dashboardAdminRoutes = require("./dashboard/admin");
const dashboardProductRoutes = require("./dashboard/product");

// Combine all routes
router.use("/admin", adminRoutes);
router.use("/app/auth", appUserRoutes);
router.use("/dashboard/admin", dashboardAdminRoutes);
router.use("/dashboard/product", dashboardProductRoutes);

module.exports = router;
