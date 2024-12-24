import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { UserRole } from '../modules/user/user.interface';
import AppError from '../errors/appError';
import catchAsync from '../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import User from '../modules/user/user.model';

const auth = (...requiredRoles: UserRole[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization;

        // checking if the token is missing
        if (!token) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
        }

        // checking if the given token is valid
        const decoded = jwt.verify(
            token,
            config.jwt_access_secret as string,
        ) as JwtPayload;

        const { role, userId, iat } = decoded;

        // checking if the user is exist
        const user = await User.isUserExistsByCustomId(userId);

        if (!user) {
            throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found !');
        }
        // checking if the user is already deleted

        if (requiredRoles && !requiredRoles.includes(role)) {
            throw new AppError(
                StatusCodes.UNAUTHORIZED,
                'You are not authorized  hi!',
            );
        }

        req.user = decoded as JwtPayload & { role: string };
        next();
    });
};

export default auth;