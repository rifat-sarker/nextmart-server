import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import User from "../user/user.model";
import { IAuth, IJwtPayload } from "./auth.interface";
import { createToken } from "./auth.utils";
import config from "../../config";

const loginUser = async (payload: IAuth) => {
  const user = await User.isUserExistsByEmail(payload.email);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found !');
  }

  if (!user.isActive) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is not active !');
  }

  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Password do not matched');
  }

  const jwtPayload: IJwtPayload = {
    userId: user._id as string,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken
  };

};

export const AuthService = {
  loginUser
}
