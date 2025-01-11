import { Schema, model, Document, Types } from "mongoose";
import { IProduct } from "./product.interface";

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
      default: null,
    },
    offer: {
      type: Number,
      default: 0,
      min: 0
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    imageUrls: {
      type: [String],
      required: [true, "Product images are required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User who created the product is required"],
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Brand of product is required"],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to auto-generate the slug before saving
productSchema.pre<IProduct>("validate", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  }
  next();
});

// Create the Product model
export const Product = model<IProduct>("Product", productSchema);
