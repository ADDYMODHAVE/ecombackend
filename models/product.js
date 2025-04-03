const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },
    composition: {
      type: [String],
      required: true,
    },
    dosageForm: {
      type: String,
      required: true,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      required: true,
    },
    mrp: {
      type: Number,
      required: true,
    },
    packSize: {
      type: [String],
      required: true,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: true,
    },
    sideEffects: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    storageInstructions: {
      type: [String],
      default: [],
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product; 