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

export const CouponService = {
   createCoupon,
   getAllCoupon,
};
