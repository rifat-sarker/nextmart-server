// src/modules/user/service.ts
import { IUser, UserRole } from './user.interface';
import User from './user.model';
import AppError from '../../errors/appError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { UserSearchableFields } from './user.constant';
import Customer from '../customer/customer.model';
import mongoose from 'mongoose';
import { IImageFile } from '../../interface/IImageFile';
import { AuthService } from '../auth/auth.service';

// Function to register user
const registerUser = async (userData: IUser) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if ([UserRole.ADMIN].includes(userData.role)) {
      throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'Invalid role. Only User is allowed.');
    }

    // Check if the user already exists by email
    const existingUser = await User.findOne({ email: userData.email }).session(session);
    if (existingUser) {
      throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'Email is already registered');
    }

    // Create the user
    const user = new User(userData);
    const createdUser = await user.save({ session });

    const profile = new Customer({
      user: createdUser._id,
    });

    await profile.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return await AuthService.loginUser({ email: createdUser.email, password: userData.password, clientInfo: userData.clientInfo });
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


const getAllUser = async (query: Record<string, unknown>) => {
  const UserQuery = new QueryBuilder(
    User.find(),
    query,
  )
    .search(UserSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await UserQuery.modelQuery;
  const meta = await UserQuery.countTotal();
  return {
    result,
    meta,
  };
};



export const UserServices = {
  registerUser,
  getAllUser
}
