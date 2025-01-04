import { Document, Types } from "mongoose";

// Updated interface for Product
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  weight: number | null;  // Weight can now be null
  offer: number;  // Could be a percentage string like '10%' or null
  category: Types.ObjectId; // Assuming reference to Category collection
  imageUrls: string[];
  isActive: boolean;
  vendor: Types.ObjectId; // Assuming reference to User collection
  createdAt?: Date;
  updatedAt?: Date;
}
