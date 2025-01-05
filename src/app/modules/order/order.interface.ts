import { Types, Document } from 'mongoose';

export interface IOrderProduct {
  product: Types.ObjectId; // Reference to the Product model
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IOrder extends Document {
  user: Types.ObjectId; // Reference to the User model
  products: IOrderProduct[]; // Array of products in the order
  coupon: Types.ObjectId | null; // Reference to the Coupon model
  totalAmount: number; // Total amount before applying discount
  discount: number; // Discount applied from the coupon
  deliveryCharge: number;
  finalAmount: number; // Final amount after applying discount
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled'; // Order status
  shippingAddress: string; // Address to ship the order
  paymentMethod: 'Cash' | 'Card' | 'Online'; // Payment method
  paymentStatus: 'Pending' | 'Paid' | 'Failed'; // Payment status
  createdAt?: Date; // Automatically added by Mongoose timestamps
  updatedAt?: Date; // Automatically added by Mongoose timestamps
}
