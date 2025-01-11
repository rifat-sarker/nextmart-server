import { Document, Types } from "mongoose";

// Updated interface for Product
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  weight: number | null;
  offer: number;
  category: Types.ObjectId;
  imageUrls: string[];
  isActive: boolean;
  vendor: Types.ObjectId;
  brand: Types.ObjectId;
  averageRating?: number;
  ratingCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
