import { Schema, model } from "mongoose";
import { IFlashSale } from "./flashSale.interface";

const flashSaleSchema = new Schema<IFlashSale>(
  {
    name: {
      type: String,
      required: [true, "Flash sale name is required"],
      trim: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product ID is required"],
        },
        discountPercentage: {
          type: Number,
          required: [true, "Discount percentage is required"],
          min: 0,
          max: 100,
        },
      },
    ],
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"]
    },
  },
  { timestamps: true }
);

export const FlashSale = model<IFlashSale>("FlashSale", flashSaleSchema);
