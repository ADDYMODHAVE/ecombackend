const Category = require("../../models/category");
const { response } = require("../../helper/common");
const { uploadImageToS3 } = require("../../helper/aws");
const common = require("../../helper/common");

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
        is_active: true,
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
  EditCategory: async (req, res) => {
    try {
      const { name, description, icon, _id } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(200).json(response(null, 0, "Category name is required"));
      }

      // Check if category with same name exists for this company
      const existingCategory = await Category.findOne({
        is_active: true,
        company_id: req.company._id,
        is_deleted: false,
        _id: _id,
      });

      if (!existingCategory) {
        return res.status(200).json(response(null, 0, "Category with this name not exists"));
      }
      let iconUrl;
      if (new URL(icon)) {
        iconUrl = icon;
      } else {
        // Upload icon to S3
        iconUrl = await uploadImageToS3(icon, process.env.AWS_S3_BUCKET_NAME, "categories");
      }
      existingCategory.name = name;
      existingCategory.description = description;
      existingCategory.icon = icon;
      existingCategory.updatedAt = common.time();
      const newUpdatedData = await existingCategory.save();

      // Create new category

      return res.status(200).json(response(newUpdatedData, 1, "Category updated successfully"));
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
        is_active,
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
  toggleCategory: async (req, res) => {
    try {
      const { category_id } = req.params;
      const { is_active } = req.body;

      const category = await Category.findOne({
        _id: category_id,
        company_id: req.company._id,
        is_deleted: false,
      });

      if (!category) {
        return res.status(200).json(response(null, 0, "Category not found"));
      }

      category.is_active = is_active;
      const updatedCategory = await category.save();

      return res.status(200).json(response(updatedCategory, 1, "Category deactivated successfully"));
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
      const { is_deleted } = req.body;
      const category = await Category.findOne({
        _id: category_id,
        company_id: req.company._id,
        is_active: is_deleted,
        is_deleted: !is_deleted,
      });

      if (!category) {
        return res.status(200).json(response(null, 0, "Deleted category not found"));
      }

      category.is_deleted = is_deleted;
      category.is_active = !is_deleted;
      const updatedCategory = await category.save();

      return res.status(200).json(response(updatedCategory, 1, "Category restored successfully"));
    } catch (error) {
      console.error("Error restoring category:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },
};

module.exports = categoryController;
