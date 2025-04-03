const express = require("express");
const router = express.Router();
const productController = require("../../controllers/dashobard/product");
const verifyToken = require("../../middleware/auth");

// Apply authentication middleware to all routes
router.use(verifyToken);

// Product routes
router.post("/add", productController.addProduct);
router.get("/all", productController.getAllProducts);
router.get("/:product_id", productController.getProductById);
router.put("/:product_id", productController.updateProduct);
router.delete("/:product_id", productController.deleteProduct);
router.patch("/:product_id/toggle-status", productController.toggleProductStatus);
router.patch("/:product_id/restore", productController.restoreProduct);

module.exports = router;
