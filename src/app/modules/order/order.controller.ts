import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { OrderService } from './order.service';
import { IJwtPayload } from '../auth/auth.interface';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createOrder = catchAsync(async (req: Request, res: Response) => {

  const result = await OrderService.createOrder(
    req.body,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Order created succesfully',
    data: result,
  });
});

export const OrderController = {
  createOrder
}
