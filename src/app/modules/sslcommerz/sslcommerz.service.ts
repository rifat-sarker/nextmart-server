import express, { Request, Response } from 'express';
import SSLCommerzPayment from 'sslcommerz-lts';
import config from '../../config';
import AppError from '../../errors/appError';
import { StatusCodes } from 'http-status-codes';
import { Payment } from '../payment/payment.model';
import { Order } from '../order/order.model';
import mongoose from 'mongoose';

const app = express();

const store_id = config.ssl.store_id as string;
const store_passwd = config.ssl.store_pass as string;
const is_live = false; // true for live, false for sandbox


// SSLCommerz init
const initPayment = async (paymentData: { total_amount: number, tran_id: string }) => {
    const { total_amount, tran_id } = paymentData;

    const data = {
        total_amount,
        currency: 'BDT',
        tran_id, // Use unique tran_id for each API call
        success_url: `${config.ssl.validation_url}?tran_id=${tran_id}`,
        fail_url: config.ssl.failed_url as string,
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://next-mart-steel.vercel.app/api/v1/ssl/ipn',
        shipping_method: 'Courier',
        product_name: 'N/A.',
        product_category: 'N/A',
        product_profile: 'general',
        cus_name: 'N/A',
        cus_email: 'N/A',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    try {
        const apiResponse = await sslcz.init(data);

        // Redirect the user to the payment gateway
        const GatewayPageURL = apiResponse.GatewayPageURL;

        if (GatewayPageURL) {
            return GatewayPageURL;
        } else {
            throw new AppError(StatusCodes.BAD_GATEWAY, "Failed to generate payment gateway URL.");
        }
    } catch (error) {
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "An error occurred while processing payment.");
    }
};


const validatePaymentService = async (tran_id: string): Promise<boolean> => {
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //@ts-ignore
        const validationResponse = await sslcz.transactionQueryByTransactionId({
            tran_id
        });

        console.log(validationResponse.element)

        let data;

        if (validationResponse.element[0].status === 'VALID' || validationResponse.element[0].status === 'VALIDATED') {

            data = {
                status: 'Paid',
                gatewayResponse: validationResponse.element[0]
            };

        } else if (validationResponse.element[0].status === 'INVALID_TRANSACTION') {
            data = {
                status: 'Failed',
                gatewayResponse: validationResponse.element[0]
            };
        } else {
            data = {
                status: 'Failed',
                gatewayResponse: validationResponse.element[0]
            };
        }


        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: validationResponse.element[0].tran_id },
            data,
            { new: true, session }
        );

        if (!updatedPayment) {
            return false;
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            updatedPayment?.order,
            {
                paymentStatus: data.status
            },
            { new: true, session }
        );

        if (!updatedOrder) {
            return false;
        }

        if (data.status === 'Failed') {
            return false;
        }

        await session.commitTransaction();
        session.endSession();

        return true;

    } catch (error) {
        // Rollback the transaction if an error occurs
        await session.abortTransaction();
        session.endSession();

        return false
    }
};


export const sslService = {
    initPayment,
    validatePaymentService
};

