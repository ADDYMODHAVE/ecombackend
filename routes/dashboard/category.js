const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/dashobard/category");
const verifyToken = require("../../middleware/auth");

// Apply authentication middleware to all routes
router.use(verifyToken);

// Category routes
router.post("/add", categoryController.addCategory);
router.put("/edit", categoryController.EditCategory);
router.get("/all", categoryController.getAllCategories);
router.get("/:category_id", categoryController.getCategoryById);
router.put("/:category_id/toggle-category", categoryController.toggleCategory);
router.put("/:category_id/restore", categoryController.restoreCategory);

module.exports = router;

`/api/dashboard/category/all?is_active=true&include_deleted=false
`;
