import { Schema, model, Document, Types } from "mongoose";
import { IProduct } from "./product.interface";
import { FlashSale } from "../flashSell/flashSale.model";

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
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
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
    availableColors: {
      type: [String],
      required: [true, "Available colors are required"],
    },
    specification: {
      type: Schema.Types.Mixed,
      default: {},
    },
    keyFeatures: {
      type: [String],
      default: [],
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

// Virtual for offerPrice
productSchema.virtual("offerPrice").get(async function () {
  const now = new Date();

  // Fetch active flash sales
  const flashSale = await FlashSale.findOne({
    "products.productId": this._id, // Check if product is part of the flash sale
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  // If flash sale exists, calculate offer price
  if (flashSale) {
    const productSale = flashSale.products.find(
      //@ts-ignore
      (p) => p.productId.toString() === this._id.toString()
    );

    if (productSale) {
      const discount = (this.price * productSale.discountPercentage) / 100;
      console.log((this.price - discount).toFixed(2))
      return (this.price - discount).toFixed(2);
    }
  }

  return null;
});


// Ensure virtual fields are included in JSON and object output
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

// Create the Product model
export const Product = model<IProduct>("Product", productSchema);
