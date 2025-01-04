import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { IImageFile, IImageFiles } from "../../interface/IImageFile";
import { IJwtPayload } from "../auth/auth.interface";
import User from "../user/user.model";
import { IProduct } from "./product.interface";
import { Category } from "../category/category.model";
import { Product } from "./product.model";
import { log } from "console";

const createProduct = async (
  productData: Partial<IProduct>,
  productImages: IImageFiles,
  authUser: IJwtPayload
) => {
  const { images } = productImages;
  productData.imageUrls = images?.map((image) => image.path);

  const isVendorExists = await User.findById(authUser.userId);

  if (!isVendorExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Vendor is not exists!");
  }

  if (!isVendorExists.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Vendor account is not active!");
  }

  console.log(productData.category);

  const isCategoryExists = await Category.findById(productData.category);

  console.log(isCategoryExists);

  if (!isCategoryExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Category is not exists!");
  }

  if (!isCategoryExists.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Category is not active!");
  }

  const product = new Product({
    ...productData,
    vendor: isVendorExists._id
  });

  const result = await product.save();
  return result;
}

export const ProductService = {
  createProduct
}