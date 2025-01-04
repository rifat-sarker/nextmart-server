import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { CategoryService } from './category.service';
import { IImageFile } from '../../interface/IImageFile';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { IUser } from '../user/user.interface';
import { IJwtPayload } from '../auth/auth.interface';

const createCategory = catchAsync(async (req: Request, res: Response) => {

  const result = await CategoryService.createCategory(
    req.body,
    req.file as IImageFile,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Category created succesfully',
    data: result,
  });
});

export const CategoryController = {
  createCategory
}
