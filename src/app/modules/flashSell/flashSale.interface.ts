import { Types } from "mongoose";

export interface IFlashSale {
  name: string;
  products: {
    productId: Types.ObjectId;
    discountPercentage: number;
  }[];
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
  createdBy?: Types.ObjectId
}