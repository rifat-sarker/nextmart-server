import { Types, Document } from 'mongoose';

export interface IOrderProduct {
  product: Types.ObjectId;
  quantity: number;
  color: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  shop: Types.ObjectId;
  products: IOrderProduct[];
  coupon: Types.ObjectId | null;
  totalAmount: number;
  discount: number;
  deliveryCharge: number;
  finalAmount: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  shippingAddress: string;
  paymentMethod: 'Cash' | 'Card' | 'Online';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  createdAt?: Date;
  updatedAt?: Date;
}
