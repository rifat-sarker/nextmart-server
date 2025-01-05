import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { IJwtPayload } from '../auth/auth.interface';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { sslService } from './sslcommerz.service';

const validatePaymentService = catchAsync(async (req: Request, res: Response) => {
    const val_id = req.query.tran_id as string;
    const result = await sslService.validatePaymentService(
        val_id
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Payment verified succesfully',
        data: result,
    });
});

export const SSLController = {
    validatePaymentService
}
