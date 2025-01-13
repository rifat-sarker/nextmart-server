import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { CouponService } from './coupon.service';
import { IJwtPayload } from '../auth/auth.interface';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createCoupon = catchAsync(async (req: Request, res: Response) => {
   const result = await CouponService.createCoupon(req.body);

   sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Coupon created successfully',
      data: result,
   });
});

const getAllCoupon = catchAsync(async (req: Request, res: Response) => {
   const result = await CouponService.getAllCoupon(req.query);

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Coupon fetched successfully',
      data: result,
   });
});

// const updateCoupon = catchAsync(async (req: Request, res: Response) => {
//    const result = await CouponService.createCoupon(req.body);

//    sendResponse(res, {
//       statusCode: StatusCodes.CREATED,
//       success: true,
//       message: 'Coupon created successfully',
//       data: result,
//    });
// });

// const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
//    const result = await CouponService.createCoupon(req.body);

//    sendResponse(res, {
//       statusCode: StatusCodes.CREATED,
//       success: true,
//       message: 'Coupon created successfully',
//       data: result,
//    });
// });

export const couponController = {
   createCoupon,
   getAllCoupon,
};
