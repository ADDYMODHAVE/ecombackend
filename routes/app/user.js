const express = require("express");
const router = express.Router();
const userController = require("../../controllers/app/user");
const { authenticateUser } = require("../../middleware/app-auth");

// Public routes
router.post("/signup", userController.signup);
router.post("/verify-otp", userController.verifyOTP);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.get("/check-token", userController.checkToken);

// Protected routes
router.post("/update-password", authenticateUser, userController.updatePassword);

module.exports = router;
