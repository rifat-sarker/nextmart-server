import { NextFunction, Request, Response } from 'express';
import AppError from '../errors/appError';
import { StatusCodes } from 'http-status-codes';
import { verifyToken } from '../modules/auth/auth.utils';
import config from '../config';

const authGuard = (...roles: string[]) => {
   return (
      req: Request & { user?: any },
      _res: Response,
      next: NextFunction
   ) => {
      const token = req.headers.authorization;
      console.log(token);
      if (!token) {
         throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }

      try {
         const verifiedUser = verifyToken(
            token,
            config.jwt_access_secret as string
         );

         console.log({ verifiedUser });

         if (roles.length && !roles.includes(verifiedUser.role)) {
            throw new AppError(
               StatusCodes.UNAUTHORIZED,
               "You don't have the permission"
            );
         }

         req.user = verifiedUser;
         next();
      } catch (error) {
         next(error);
      }
   };
};

export default authGuard;
