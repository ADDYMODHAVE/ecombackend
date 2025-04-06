const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/dashobard/category");
const verifyToken = require("../../middleware/auth");

// Apply authentication middleware to all routes
router.use(verifyToken);

// Category routes
router.post("/add", categoryController.addCategory);
router.get("/all", categoryController.getAllCategories);
router.get("/:category_id", categoryController.getCategoryById);
router.patch("/:category_id/deactivate", categoryController.deactivateCategory);
router.delete("/:category_id", categoryController.deleteCategory);
router.patch("/:category_id/restore", categoryController.restoreCategory);

module.exports = router;

`/api/dashboard/category/all?is_active=true&include_deleted=false
`;
