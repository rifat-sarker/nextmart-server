import { IJwtPayload } from "../auth/auth.interface";
import { ICoupon } from "./coupon.interface";
import { Coupon } from "./coupon.model";

const createCoupon = async (couponData: Partial<ICoupon>) => {
  const coupon = new Coupon(couponData);
  return await coupon.save();
}

export const CouponService = {
  createCoupon
}
