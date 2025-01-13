import mongoose from "mongoose";
import { IImageFile } from "../../interface/IImageFile";
import { IShop } from "./shop.interface";
import { IJwtPayload } from "../auth/auth.interface";
import User from "../user/user.model";

const createShop = async (shopData: Partial<IShop>, logo: IImageFile, authUser: IJwtPayload) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the user already exists by email
    const existingUser = await User.findOne({ email: userData.email }).session(session);
    if (existingUser) {
      throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'Email is already registered');
    }

    // Create the user
    const user = new User({
      ...userData,
      role: UserRole.VENDOR
    });
    const createdUser = await user.save({ session });

    if (logo) {
      vendor.logo = logo.path
    }

    const profile = new Vendor({
      user: createdUser._id,
      ...vendor
    });

    await profile.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return createdUser;
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};