const Category = require("../../models/category");
const { response } = require("../../helper/common");
const { uploadImageToS3 } = require("../../helper/aws");

const categoryController = {
  // Add a new category
  addCategory: async (req, res) => {
    try {
      const { name, description, icon } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(200).json(response(null, 0, "Category name is required"));
      }

      // Check if category with same name exists for this company
      const existingCategory = await Category.findOne({
        name,
        company_id: req.company._id,
        is_deleted: false,
      });

      if (existingCategory) {
        return res.status(200).json(response(null, 0, "Category with this name already exists"));
      }

      let iconUrl = null;
      if (icon) {
        // Upload icon to S3
        iconUrl = await uploadImageToS3(icon, process.env.AWS_S3_BUCKET_NAME, "categories");
      }

      // Create new category
      const category = await Category.create({
        name,
        description,
        icon: iconUrl,
        company_id: req.company._id,
        is_active: true,
        is_deleted: false,
      });

      return res.status(201).json(response(category, 1, "Category added successfully"));
    } catch (error) {
      console.error("Error adding category:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Get all categories for a company
  getAllCategories: async (req, res) => {
    try {
      const { is_active, include_deleted } = req.query;

      // Build query
      const query = {
        company_id: req.company._id,
      };

      // Filter by active status if provided
      if (is_active !== undefined) {
        query.is_active = is_active === "true";
      }

      // Include deleted categories if requested
      if (include_deleted !== "true") {
        query.is_deleted = false;
      }

      const categories = await Category.find(query).sort({ createdAt: -1 });

      return res.status(200).json(response(categories, 1, "Categories retrieved successfully"));
    } catch (error) {
      console.error("Error retrieving categories:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Get a single category by ID
  getCategoryById: async (req, res) => {
    try {
      const { category_id } = req.params;

      const category = await Category.findOne({
        _id: category_id,
        company_id: req.company._id,
        is_deleted: false,
      });

      if (!category) {
        return res.status(200).json(response(null, 0, "Category not found"));
      }

      return res.status(200).json(response(category, 1, "Category retrieved successfully"));
    } catch (error) {
      console.error("Error retrieving category:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Deactivate a category
  deactivateCategory: async (req, res) => {
    try {
      const { category_id } = req.params;

      const category = await Category.findOne({
        _id: category_id,
        company_id: req.company._id,
        is_deleted: false,
      });

      if (!category) {
        return res.status(200).json(response(null, 0, "Category not found"));
      }

      category.is_active = false;
      await category.save();

      return res.status(200).json(response(category, 1, "Category deactivated successfully"));
    } catch (error) {
      console.error("Error deactivating category:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Delete a category (soft delete)
  deleteCategory: async (req, res) => {
    try {
      const { category_id } = req.params;

      const category = await Category.findOne({
        _id: category_id,
        company_id: req.company._id,
        is_deleted: false,
      });

      if (!category) {
        return res.status(200).json(response(null, 0, "Category not found"));
      }

      category.is_deleted = true;
      await category.save();

      return res.status(200).json(response(null, 1, "Category deleted successfully"));
    } catch (error) {
      console.error("Error deleting category:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Restore a deleted category
  restoreCategory: async (req, res) => {
    try {
      const { category_id } = req.params;

      const category = await Category.findOne({
        _id: category_id,
        company_id: req.company._id,
        is_deleted: true,
      });

      if (!category) {
        return res.status(200).json(response(null, 0, "Deleted category not found"));
      }

      category.is_deleted = false;
      await category.save();

      return res.status(200).json(response(category, 1, "Category restored successfully"));
    } catch (error) {
      console.error("Error restoring category:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },
};

module.exports = categoryController; 