import mongoose, { Types } from "mongoose"
import { IJwtPayload } from "../auth/auth.interface"
import { Coupon } from "../coupon/coupon.model"
import { IOrder } from "./order.interface"
import { Order } from "./order.model"
import { Product } from "../product/product.model"

const createOrder = async (orderData: Partial<IOrder>, authUser: IJwtPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Handle coupon and update orderData
    if (orderData.coupon) {
      const coupon = await Coupon.findOne({ code: orderData.coupon }).session(session);
      if (coupon) {
        const currentDate = new Date();

        // Check if the coupon is within the valid date range
        if (currentDate < coupon.startDate) {
          throw new Error(`Coupon ${coupon.code} has not started yet.`);
        }

        if (currentDate > coupon.endDate) {
          throw new Error(`Coupon ${coupon.code} has expired.`);
        }

        orderData.coupon = coupon._id as Types.ObjectId;
      } else {
        throw new Error('Invalid coupon code.');
      }
    }

    // Update stock for each product in the order
    if (orderData.products) {
      for (const productItem of orderData.products) {
        const product = await Product.findById(productItem.product).session(session);

        if (product) {
          if (product.stock < productItem.quantity) {
            throw new Error(`Insufficient stock for product: ${product.name}`);
          }
          // Decrement the product stock
          product.stock -= productItem.quantity;
          await product.save({ session });
        } else {
          throw new Error(`Product not found: ${productItem.product}`);
        }
      }
    }

    // Create the order
    const order = new Order({
      ...orderData,
      user: authUser.userId,
    });
    await order.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    // Rollback the transaction in case of error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const OrderService = {
  createOrder
}
