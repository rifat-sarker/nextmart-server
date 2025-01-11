import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { IImageFile, IImageFiles } from "../../interface/IImageFile";
import { IJwtPayload } from "../auth/auth.interface";
import User from "../user/user.model";
import { IProduct } from "./product.interface";
import { Category } from "../category/category.model";
import { Product } from "./product.model";
import { log } from "console";
import QueryBuilder from "../../builder/QueryBuilder";
import { ProductSearchableFields } from "./product.constant";
import { Order } from "../order/order.model";

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

  const isCategoryExists = await Category.findById(productData.category);

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

const getAllProduct = async (query: Record<string, unknown>) => {
  const { minPrice, maxPrice, ...pQuery } = query;
  const productQuery = new QueryBuilder(Product.find(), pQuery)
    .search(ProductSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields()
    .priceRange(Number(minPrice), Number(maxPrice));

  const result = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return {
    meta,
    result,
  };
}


const getTrendingProducts = async (limit: number) => {
  const now = new Date();
  const last30Days = new Date(now.setDate(now.getDate() - 30));

  const trendingProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: last30Days },
      },
    },
    {
      $unwind: "$products",
    },
    {
      $group: {
        _id: "$products.product",
        orderCount: { $sum: "$products.quantity" },
      },
    },
    {
      $sort: { orderCount: -1 },
    },
    {
      $limit: limit || 10,
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: "$productDetails",
    },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        orderCount: 1,
        name: "$productDetails.name",
        price: "$productDetails.price",
        offer: "$productDetails.offer",
        imageUrls: "$productDetails.imageUrls",
      },
    },
  ]);

  return trendingProducts;
};


export const ProductService = {
  createProduct,
  getAllProduct,
  getTrendingProducts
}