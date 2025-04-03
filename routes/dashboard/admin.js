const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/dashobard/admin");
const verifyToken = require("../../middleware/auth");

// Public routes
router.post("/register", adminController.register);
router.post("/login", adminController.login);
router.post("/check-token", adminController.checkToken);

// // Protected routes
// router.use(verifyToken);
// router.get("/profile", adminController.getProfile);
// router.put("/profile", adminController.updateProfile);
// router.put("/change-password", adminController.changePassword);

module.exports = router; 