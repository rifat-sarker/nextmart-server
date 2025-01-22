import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import { MetaService } from './meta.service';

const getMetaData = catchAsync(async (req: Request, res: Response) => {
   const result = await MetaService.getMetaData();
   sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Meta data retrieved successfully',
      data: result,
   });
});

export const MetaController = {
   getMetaData,
};
