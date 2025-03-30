const express = require("express");
const router = express.Router();
const adminController = require("../controllers/dashobard/admin");

router.post("/register", adminController.register);
router.post("/login", adminController.login);
router.post("/check-token", adminController.checkToken);

module.exports = router;
