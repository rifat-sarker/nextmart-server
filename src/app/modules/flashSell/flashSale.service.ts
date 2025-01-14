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

export const FlashSaleService = {
  createFlashSale
}