import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';

const loginUser = catchAsync(async (req: Request, res: Response) => {

  const result = await AuthService.loginUser(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User loggedin succesfully',
    data: result,
  });
});

export const AuthController = {
  loginUser
}
