import { StatusCodes } from 'http-status-codes';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { IJwtPayload } from '../auth/auth.interface';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/appError';
import QueryBuilder from '../../builder/QueryBuilder';

export const createReview = async (payload: IReview, user: JwtPayload) => {
   console.log({ user, data: payload });

   const existingReview = await Review.findOne({
      user: user.userId,
      product: payload.product,
   });
   if (existingReview) {
      throw new AppError(
         StatusCodes.BAD_REQUEST,
         'You have already reviewed this product.'
      );
   }

   const review = await Review.create({ ...payload, user: user.userId });
   return review;
};

export const getAllReviews = async (query: Record<string, unknown>) => {
   const brandQuery = new QueryBuilder(Review.find(), query)
      .search(['review'])
      .filter()
      .sort()
      .paginate()
      .fields();

   const result = await brandQuery.modelQuery;
   const meta = await brandQuery.countTotal();

   return {
      meta,
      result,
   };
};

export const ReviewServices = {
   createReview,
   getAllReviews,
};
