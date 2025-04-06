const Product = require("../../models/product");
const Categories = require("../../models/category");
const { response } = require("../../helper/common");
const { uploadMultipleImages } = require("../../helper/aws");

const productController = {
  // Add a new product
  addProduct: async (req, res) => {
    try {
      const {
        name,
        description,
        category,
        manufacturer,
        sku,
        batchNumber,
        composition,
        dosageForm,
        expiryDate,
        featured,
        images,
        mrp,
        packSize,
        prescriptionRequired,
        price,
        sideEffects,
        stock,
        storageInstructions,
        category_id,
      } = req.body;

      // Validate required fields
      if (
        !name ||
        !description ||
        !category ||
        !manufacturer ||
        !sku ||
        !batchNumber ||
        !composition ||
        !dosageForm ||
        !expiryDate ||
        !images ||
        !mrp ||
        !packSize ||
        !price ||
        !stock
      ) {
        return res.status(200).json(response(null, 0, "All required fields must be provided"));
      }
      const existingProduct = await Product.findOne({
        sku,
        company_id: req.company._id,
        is_deleted: false,
        is_active: true,
      });

      if (existingProduct) {
        return res.status(200).json(response(null, 0, "Product with this SKU already exists"));
      }

      const uploadedImageUrls = await uploadMultipleImages(images, process.env.AWS_S3_BUCKET_NAME);

      // Create new product
      const findCategory = await Categories.findOne({
        _id: category_id,
        is_active: true,
        is_deleted: false,
        company_id: req.company._id,
      });
      const product = await Product.create({
        name,
        description,
        category_id,
        manufacturer,
        sku,
        batchNumber,
        composition,
        dosageForm,
        expiryDate,
        featured: featured || false,
        images: uploadedImageUrls,
        mrp,
        packSize,
        prescriptionRequired: prescriptionRequired || false,
        price,
        sideEffects: sideEffects || [],
        stock,
        storageInstructions: storageInstructions || [],
        company_id: req.company._id,
        is_active: true,
        is_deleted: false,
      });

      return res.status(201).json(response(product, 1, "Product added successfully"));
    } catch (error) {
      console.error("Error adding product:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Get all products for a company
  getAllProducts: async (req, res) => {
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

      // Include deleted products if requested
      if (include_deleted !== "true") {
        query.is_deleted = false;
      }

      const products = await Product.find(query).sort({ createdAt: -1 });

      return res.status(200).json(response(products, 1, "Products retrieved successfully"));
    } catch (error) {
      console.error("Error retrieving products:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Get a single product by ID
  getProductById: async (req, res) => {
    try {
      const { product_id } = req.params;

      const product = await Product.findOne({
        _id: product_id,
        company_id: req.company._id,
        is_deleted: false,
        is_active,
      });

      if (!product) {
        return res.status(200).json(response(null, 0, "Product not found"));
      }

      return res.status(200).json(response(product, 1, "Product retrieved successfully"));
    } catch (error) {
      console.error("Error retrieving product:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Update a product
  updateProduct: async (req, res) => {
    try {
      const { product_id } = req.params;
      const updateData = { ...req.body };

      // Find the product
      const product = await Product.findOne({
        _id: product_id,
        company_id: req.company._id,
        is_deleted: false,
        is_active: true,
      });

      if (!product) {
        return res.status(200).json(response(null, 0, "Product not found"));
      }

      // If images are provided, upload them to S3
      if (updateData.images && updateData.images.length > 0) {
        const uploadedImageUrls = await uploadMultipleImages(updateData.images, process.env.AWS_S3_BUCKET_NAME);
        updateData.images = uploadedImageUrls;
      }

      // Ensure is_active and is_deleted are not modified through the update
      delete updateData.is_active;
      delete updateData.is_deleted;
      delete updateData.company_id;

      // Update the product
      const updatedProduct = await Product.findByIdAndUpdate(product_id, { $set: updateData }, { new: true });

      return res.status(200).json(response(updatedProduct, 1, "Product updated successfully"));
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Delete a product (soft delete)
  deleteProduct: async (req, res) => {
    try {
      const { product_id } = req.params;

      const product = await Product.findOne({
        _id: product_id,
        company_id: req.company._id,
        is_deleted: false,
      });

      if (!product) {
        return res.status(200).json(response(null, 0, "Product not found"));
      }

      // Soft delete
      product.is_deleted = true;
      await product.save();

      return res.status(200).json(response(null, 1, "Product deleted successfully"));
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Toggle product active status
  toggleProductStatus: async (req, res) => {
    try {
      const { product_id } = req.params;
      const { is_active } = req.body;

      if (typeof is_active !== "boolean") {
        return res.status(200).json(response(null, 0, "is_active must be a boolean value"));
      }

      const product = await Product.findOne({
        _id: product_id,
        company_id: req.company._id,
        is_deleted: false,
      });

      if (!product) {
        return res.status(200).json(response(null, 0, "Product not found"));
      }

      // Update is_active status
      product.is_active = is_active;
      await product.save();

      return res.status(200).json(response({ is_active: product.is_active }, 1, `Product ${is_active ? "activated" : "deactivated"} successfully`));
    } catch (error) {
      console.error("Error toggling product status:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },

  // Restore a deleted product
  restoreProduct: async (req, res) => {
    try {
      const { product_id } = req.params;

      const product = await Product.findOne({
        _id: product_id,
        company_id: req.company._id,
        is_deleted: true,
      });

      if (!product) {
        return res.status(200).json(response(null, 0, "Deleted product not found"));
      }

      // Restore product
      product.is_deleted = false;
      await product.save();

      return res.status(200).json(response(product, 1, "Product restored successfully"));
    } catch (error) {
      console.error("Error restoring product:", error);
      return res.status(500).json(response(null, 0, error.message));
    }
  },
};

module.exports = productController;
