import { Request, Response } from 'express';
import { UserServices } from './user.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.registerUser(
    req.body
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User created succesfully',
    data: result,
  });
});

export const UserController = {
  registerUser,
}