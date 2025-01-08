import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';

const loginUser = catchAsync(async (req, res) => {
   const result = await AuthService.loginUser(req.body);
   const { refreshToken, accessToken } = result;

   res.cookie('refreshToken', refreshToken, {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 365,
   });

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User logged in successfully!',
      data: {
         accessToken,
      },
   });
});

// refresh token
const refreshToken = catchAsync(async (req: Request, res: Response) => {
   const { refreshToken } = req.cookies;
   console.log(req.cookies);
   const result = await AuthService.refreshToken(refreshToken);
   console.log(result);
});

// change password
const changePassword = catchAsync(
   async (req: Request & { user?: any }, res: Response) => {
      const user = req.user;
      const payload = req.body;
   }
);

// forgot password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {});

// reset password

export const AuthController = {
   loginUser,
   refreshToken,
   changePassword,
   forgotPassword,
};
