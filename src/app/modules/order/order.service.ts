import mongoose, { Types } from "mongoose"
import { IJwtPayload } from "../auth/auth.interface"
import { Coupon } from "../coupon/coupon.model"
import { IOrder } from "./order.interface"
import { Order } from "./order.model"
import { Product } from "../product/product.model"
import { Payment } from "../payment/payment.model"
import { generateTransactionId } from "../payment/payment.utils"
import { sslService } from "../sslcommerz/sslcommerz.service"
import { generateOrderInvoicePDF } from "../../utils/generateOrderInvoicePDF"
import { EmailHelper } from "../../utils/emailHelper"

const createOrder = async (orderData: Partial<IOrder>, authUser: IJwtPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (orderData.products) {
      for (const productItem of orderData.products) {
        const product = await Product.findById(productItem.product).populate('shop').session(session);

        if (product) {
          if (product.isActive === false) {
            throw new Error(`Product ${product?.name} is inactive.`);
          }

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

    // Create the order
    const order = new Order({
      ...orderData,
      user: authUser.userId,
    });

    const createdOrder = await order.save({ session });
    await createdOrder.populate('user products.product');

    const transactionId = generateTransactionId();

    const payment = new Payment({
      user: authUser.userId,
      shop: createdOrder.shop,
      order: createdOrder._id,
      method: orderData.paymentMethod,
      transactionId,
      amount: createdOrder.finalAmount
    });

    await payment.save({ session })

    let result;

    if (orderData.paymentMethod == 'Online') {
      result = await sslService.initPayment({
        total_amount: createdOrder.finalAmount,
        tran_id: transactionId
      });
      result = { paymentUrl: result }
    } else {
      result = order;
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    const pdfBuffer = await generateOrderInvoicePDF(createdOrder);
    const emailContent = await EmailHelper.createEmailContent(
      //@ts-ignore
      { userName: createdOrder.user.name || "" },
      'orderInvoice'
    );

    const attachment = {
      filename: `Invoice_${createdOrder._id}.pdf`,
      content: pdfBuffer,
      encoding: 'base64', // if necessary
    };

    await EmailHelper.sendEmail(
      //@ts-ignore
      createdOrder.user.email,
      emailContent,
      "Order confirmed!",
      attachment
    );
    return result;
  } catch (error) {
    console.log(error)
    // Rollback the transaction in case of error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const OrderService = {
  createOrder
}
