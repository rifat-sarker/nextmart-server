import { IJwtPayload } from "../auth/auth.interface"
import { IOrder } from "./order.interface"
import { Order } from "./order.model"

const createOrder = async (orderData: Partial<IOrder>, authUser: IJwtPayload) => {
  const order = new Order({
    ...orderData,
    user: authUser.userId
  });

  return await order.save();
}

export const OrderService = {
  createOrder
}
