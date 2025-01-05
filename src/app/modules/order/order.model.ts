import { Schema, model } from 'mongoose';
import { IOrder } from './order.interface';
import { Product } from '../product/product.model';
import { Coupon } from '../coupon/coupon.model';

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    coupon: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Online'],
      default: 'Online',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate total, discount, delivery charge, and final price
orderSchema.pre('validate', async function (next) {
  const order = this;

  // Step 1: Initialize total amount
  let totalAmount = 0;
  let finalDiscount = 0;
  let vendorId: Schema.Types.ObjectId | null = null;

  // Step 2: Calculate total amount for products
  for (let item of order.products) {
    const product = await Product.findById(item.product).populate('vendor');

    if (!product || product.isActive === false) {
      return next(new Error(`Product ${product?.name} is inactive.`));
    }

    // Check product stock availability
    if (product.stock < item.quantity) {
      return next(new Error(`Not enough stock for ${product.name}.`));
    }

    // Check if products are from the same vendor
    if (vendorId && String(vendorId) !== String(product.vendor._id)) {
      return next(new Error('Products must be from the same vendor.'));
    }
    //@ts-ignore
    vendorId = product.vendor._id;

    // Calculate price with product offer
    const offerPrice = product.price * (1 - product.offer / 100);
    const price = offerPrice * item.quantity;
    totalAmount += price;
  }

  // Step 3: Apply coupon discount (if any)
  if (order.coupon) {
    const couponDetails = await Coupon.findById(order.coupon);
    if (couponDetails && couponDetails.isActive) {
      // Check if coupon is applicable based on order amount
      if (totalAmount >= couponDetails.minOrderAmount) {
        if (couponDetails.discountType === 'Percentage') {
          finalDiscount = (couponDetails.discountValue / 100) * totalAmount;
        } else if (couponDetails.discountType === 'Flat') {
          finalDiscount = Math.min(couponDetails.discountValue, totalAmount);
        }
      }
    }
  }

  // Step 4: Calculate delivery charge based on shipping address
  const isDhaka = order.shippingAddress.toLowerCase().includes('dhaka');
  const deliveryCharge = isDhaka ? 60 : 120;

  // Step 5: Calculate final amount
  order.totalAmount = totalAmount;
  order.discount = finalDiscount;
  order.deliveryCharge = deliveryCharge;
  order.finalAmount = totalAmount - finalDiscount + deliveryCharge;

  next();
});

// Create the Order model
export const Order = model<IOrder>('Order', orderSchema);
