import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { IJwtPayload } from "../auth/auth.interface";
import { IFlashSale } from "./flashSale.interface";
import { FlashSale } from "./flashSale.model";


const createFlashSale = async (flashSellData: IFlashSale, authUser: IJwtPayload) => {

  const { name, products, startDate, endDate } = flashSellData;

  const overlappingSale = await FlashSale.findOne({
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
      { isActive: true },
    ],
  });

  if (overlappingSale) {
    throw new AppError(StatusCodes.BAD_REQUEST, "An active or overlapping flash sale already exists. Only one flash sale can run at a time.");
  }

  const flashSale = new FlashSale({
    ...flashSellData,
    createdBy: authUser.userId
  });

  await flashSale.save();
  return flashSale;
};


interface IGetFlashSalesParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  minDiscount?: number;
  maxDiscount?: number;
}

const getActiveFlashSalesService = async (params: Partial<IGetFlashSalesParams>) => {
  let { page = 1, limit = 10, sortBy = "discountPercentage", sortOrder = "desc", minDiscount, maxDiscount } = params;

  // Ensure valid numbers for pagination
  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;

  const query: any = {
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
    isActive: true,
  };

  if (minDiscount !== undefined) {
    query["products.discountPercentage"] = { $gte: minDiscount };
  }

  if (maxDiscount !== undefined) {
    query["products.discountPercentage"] = { $lte: maxDiscount };
  }

  const flashSales = await FlashSale.aggregate([
    {
      $match: query,
    },
    {
      $unwind: "$products",
    },
    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: "$productDetails",
    },
    {
      $project: {
        name: 1,
        "productDetails.name": 1,
        "productDetails.price": 1,
        "productDetails.offerPrice": {
          $round: [
            {
              $subtract: [
                "$productDetails.price",
                {
                  $multiply: [
                    "$productDetails.price",
                    { $divide: ["$products.discountPercentage", 100] },
                  ],
                },
              ],
            },
            2, // Round to 2 decimal places
          ],
        },
        "productDetails._id": 1,
        "productDetails.shop": 1,
        "productDetails.stock": 1,
        "productDetails.ratingCount": 1,
        "productDetails.averageRating": 1,
        "productDetails.brand": 1,
        "productDetails.imageUrls": 1, // Include the image URLs
        "products.discountPercentage": 1,
        "products.productId": 1,
      },
    },
    {
      $sort: {
        [sortBy]: sortOrder === "desc" ? -1 : 1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  return flashSales;
};



export const FlashSaleService = {
  createFlashSale,
  getActiveFlashSalesService
}