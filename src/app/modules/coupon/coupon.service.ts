import { IJwtPayload } from '../auth/auth.interface';
import { ICoupon } from './coupon.interface';
import { Coupon } from './coupon.model';

const createCoupon = async (couponData: Partial<ICoupon>) => {
   const coupon = new Coupon(couponData);
   return await coupon.save();
};

const getAllCoupon = async (couponData: Partial<ICoupon>) => {
   const result = await Coupon.find({});

   return result;
};

export const CouponService = {
   createCoupon,
   getAllCoupon,
};
