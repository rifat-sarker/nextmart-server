import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { ProductService } from './product.service';
import { IImageFiles } from '../../interface/IImageFile';
import { IJwtPayload } from '../auth/auth.interface';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createProduct = catchAsync(async (req: Request, res: Response) => {
   const result = await ProductService.createProduct(
      req.body,
      req.files as IImageFiles,
      req.user as IJwtPayload
   );

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Product created successfully',
      data: result,
   });
});

const getAllProduct = catchAsync(async (req, res) => {
   const result = await ProductService.getAllProduct(req.query);

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Products are retrieved successfully',
      meta: result.meta,
      data: result.result,
   });
});

const getTrendingProducts = catchAsync(async (req, res) => {
   const { limit } = req.query;
   const result = await ProductService.getTrendingProducts(Number(limit));

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Products are retrieved successfully',
      data: result,
   });
});
const getSingleProduct = catchAsync(async (req, res) => {
   const { productId } = req.params;
   const result = await ProductService.getSingleProduct(productId);

   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Product retrieved successfully',
      data: result,
   });
});

export const ProductController = {
   createProduct,
   getAllProduct,
   getTrendingProducts,
   getSingleProduct,
};
