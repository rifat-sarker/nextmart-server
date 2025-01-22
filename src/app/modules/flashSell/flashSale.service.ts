import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { IJwtPayload } from "../auth/auth.interface";
import { ICreateFlashSaleInput, IFlashSale } from "./flashSale.interface";
import { FlashSale } from "./flashSale.model";
import User from "../user/user.model";
import Shop from "../shop/shop.model";
import QueryBuilder from "../../builder/QueryBuilder";


const createFlashSale = async (flashSellData: ICreateFlashSaleInput, authUser: IJwtPayload) => {
  const userHasShop = await User.findById(authUser.userId).select('isActive hasShop');

  if (!userHasShop) throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  if (!userHasShop.isActive) throw new AppError(StatusCodes.BAD_REQUEST, "User account is not active!");
  if (!userHasShop.hasShop) throw new AppError(StatusCodes.BAD_REQUEST, "User does not have any shop!");

  const shopIsActive = await Shop.findOne({
    user: userHasShop._id,
    isActive: true
  }).select("isActive");

  if (!shopIsActive) throw new AppError(StatusCodes.BAD_REQUEST, "Shop is not active!");

  const { products, discountPercentage } = flashSellData;
  const createdBy = authUser.userId;

  const operations = products.map((product) => ({
    updateOne: {
      filter: { product },
      update: {
        $setOnInsert: {
          product,
          discountPercentage,
          createdBy,
        },
      },
      upsert: true,
    },
  }));

  const result = await FlashSale.bulkWrite(operations);
  return result;
};


const getActiveFlashSalesService = async (query: Record<string, unknown>) => {
  const { minPrice, maxPrice, ...pQuery } = query;

  const productQuery = new QueryBuilder(
    FlashSale.find()
      .populate('product'),
    query
  )
    .paginate()


  const result = await productQuery.modelQuery;

  // const productsWithOfferPrice = await Promise.all(
  //   products.map(async (product) => {
  //     const productDoc = await Product.findById(product._id);
  //     const offerPrice = productDoc?.offerPrice;
  //     return {
  //       ...product,
  //       offerPrice: Number(offerPrice) || null,
  //     };
  //   })
  // );

  const meta = await productQuery.countTotal();

  return {
    meta,
    result
  };
};




export const FlashSaleService = {
  createFlashSale,
  getActiveFlashSalesService
}