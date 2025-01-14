import QueryBuilder from '../../builder/QueryBuilder';
import { IJwtPayload } from '../auth/auth.interface';
import { ICoupon } from './coupon.interface';
import { Coupon } from './coupon.model';

const createCoupon = async (couponData: Partial<ICoupon>) => {
   const coupon = new Coupon(couponData);
   return await coupon.save();
};

const getAllCoupon = async (query: Record<string, unknown>) => {
   const brandQuery = new QueryBuilder(Coupon.find(), query)
      .search(['code'])
      .filter()
      .sort()
      .paginate()
      .fields();

   const result = await brandQuery.modelQuery;
   const meta = await brandQuery.countTotal();

   return {
      meta,
      result,
   };
};

// need to improve
const updateCoupon = async (payload: Partial<ICoupon>, couponCode: string) => {
   console.log({ payload, couponCode });

   const currentDate = new Date();

   const updatedCoupon = await Coupon.findOneAndUpdate(
      {
         code: couponCode.toUpperCase(),
         isActive: true,
         endDate: { $gte: currentDate },
      },
      { $set: payload },
      { new: true, runValidators: true }
   );

   if (!updatedCoupon) {
      throw new Error('Coupon not found or is either inactive or expired.');
   }

   return updatedCoupon;
};

const getCouponById = async (couponCode: string) => {
   const currentDate = new Date();

   const coupon = await Coupon.findOne({ code: couponCode });

   if (!coupon) {
      throw new Error('Coupon not found.');
   }

   if (!coupon.isActive) {
      throw new Error('Coupon is inactive.');
   }

   if (coupon.endDate < currentDate) {
      throw new Error('Coupon has expired.');
   }

   return coupon;
};

export const CouponService = {
   createCoupon,
   getAllCoupon,
   updateCoupon,
   getCouponById,
};
