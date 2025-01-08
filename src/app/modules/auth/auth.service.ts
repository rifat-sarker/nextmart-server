import { ClientSession } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/appError';
import User from '../user/user.model';
import { IAuth, IJwtPayload } from './auth.interface';
import { createToken, verifyToken } from './auth.utils';
import config from '../../config';
import mongoose from 'mongoose';
import { JwtPayload, Secret } from 'jsonwebtoken';
import { VerifiedUser } from '../../interface/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import emailSender from '../../utils/emailSender';
import { generateOtp } from '../../utils/generateOtp';

const loginUser = async (payload: IAuth) => {
   const session = await mongoose.startSession();

   try {
      session.startTransaction();

      const user = await User.findOne({ email: payload.email }).session(
         session
      );
      if (!user) {
         throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
      }

      if (!user.isActive) {
         throw new AppError(StatusCodes.FORBIDDEN, 'This user is not active!');
      }

      if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
         throw new AppError(StatusCodes.FORBIDDEN, 'Password does not match');
      }

      const jwtPayload: IJwtPayload = {
         userId: user._id as string,
         role: user.role,
      };

      const accessToken = createToken(
         jwtPayload,
         config.jwt_access_secret as string,
         config.jwt_access_expires_in as string
      );

      const refreshToken = createToken(
         jwtPayload,
         config.jwt_refresh_secret as string,
         config.jwt_refresh_expires_in as string
      );

      const updateUserInfo = await User.findByIdAndUpdate(
         user._id,
         { clientInfo: payload.clientInfo, lastLogin: Date.now() },
         { new: true, session }
      );

      await session.commitTransaction();

      return {
         accessToken,
         refreshToken,
      };
   } catch (error) {
      await session.abortTransaction();
      throw error;
   } finally {
      session.endSession();
   }
};

const refreshToken = async (refreshToken: string) => {
   let decodedData;
   try {
      decodedData = verifyToken(
         refreshToken,
         config.jwt_refresh_secret as string
      );
   } catch (err) {
      throw new Error('You are not authorized!');
   }

   console.log(decodedData);

   // @ more logic will fo here

   return {
      // accessToken,
   };
};

const changePassword = async (
   userData: JwtPayload,
   payload: { oldPassword: string; newPassword: string }
) => {
   const { userId } = userData;
   const { oldPassword, newPassword } = payload;

   const user = await User.findOne({ _id: userId });
   if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
   }
   if (!user.isActive) {
      throw new AppError(StatusCodes.FORBIDDEN, 'User account is inactive');
   }

   // Validate old password
   const isOldPasswordCorrect = await User.isPasswordMatched(
      oldPassword,
      user.password
   );
   if (!isOldPasswordCorrect) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Incorrect old password');
   }

   // Hash and update the new password
   const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(config.bcrypt_salt_rounds)
   );
   await User.updateOne({ _id: userId }, { password: hashedPassword });

   return { message: 'Password changed successfully' };
};

const forgotPassword = async ({ email }: { email: string }) => {
   const user = await User.findOne({ email: email });
   if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
   }

   const otp = generateOtp();

   // Creating a JWT token with the OTP and a 5 minute expiry
   const otpToken = jwt.sign({ otp, email }, config.jwt_otp_secret as string, {
      expiresIn: '5m',
   });

   await User.updateOne({ email }, { otpToken });

   const htmlFilePath = path.join(
      process.cwd(),
      '/src/templates/otp_template.html'
   );
   const htmlTemplate = fs.readFileSync(htmlFilePath, 'utf8');
   const htmlContent = htmlTemplate.replace('{{otpCode}}', otp);

   try {
      await emailSender(email, htmlContent);
   } catch (error) {
      await User.updateOne({ email }, { $unset: { otpToken: 1 } });

      throw new AppError(
         StatusCodes.INTERNAL_SERVER_ERROR,
         'Failed to send OTP email. Please try again later.'
      );
   }
};

const resetPassword = async ({
   email,
   otp,
   newPassword,
}: {
   email: string;
   otp: string;
   newPassword: string;
}) => {
   const session: ClientSession = await User.startSession();

   try {
      session.startTransaction();

      const user = await User.findOne({ email: email }).session(session);
      if (!user) {
         throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
      }

      if (!user.otpToken || user.otpToken === '') {
         throw new AppError(
            StatusCodes.BAD_REQUEST,
            'No OTP token found. Please request a new password reset OTP.'
         );
      }

      const decodedOtpData = verifyToken(
         user.otpToken as string,
         config.jwt_otp_secret as string
      );

      if (!decodedOtpData) {
         throw new AppError(
            StatusCodes.FORBIDDEN,
            'OTP has expired or is invalid'
         );
      }

      if (decodedOtpData.otp !== otp) {
         throw new AppError(StatusCodes.FORBIDDEN, 'Invalid OTP');
      }

      const hashedPassword = await bcrypt.hash(
         String(newPassword),
         Number(config.bcrypt_salt_rounds)
      );

      await User.updateOne({ email }, { password: hashedPassword }).session(
         session
      );

      await User.updateOne({ email }, { $unset: { otpToken: '' } }).session(
         session
      );

      await session.commitTransaction();

      return {
         message: 'Password changed successfully',
      };
   } catch (error) {
      await session.abortTransaction();
      throw error;
   } finally {
      session.endSession();
   }
};

export const AuthService = {
   loginUser,
   refreshToken,
   changePassword,
   forgotPassword,
   resetPassword,
};
