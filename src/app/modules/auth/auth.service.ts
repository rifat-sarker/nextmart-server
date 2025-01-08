import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/appError';
import User from '../user/user.model';
import { IAuth, IJwtPayload } from './auth.interface';
import { createToken, verifyToken } from './auth.utils';
import config from '../../config';
import mongoose from 'mongoose';
import { Secret } from 'jsonwebtoken';

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
   console.log(refreshToken);
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

   //   const userData = await prisma.user.findUniqueOrThrow({
   //     where: {
   //        email: decodedData.email,
   //        status: UserStatus.ACTIVE,
   //     },
   //  });

   //  const accessToken = createToken(
   //     {
   //        email: userData.email,
   //        role: userData.role,
   //     },
   //     config.jwt.jwt_secret as Secret,
   //     config.jwt.expires_in as string
   //  );

   return {
      // accessToken,
   };
};

export const AuthService = {
   loginUser,
   refreshToken,
};
