import { Schema, model } from 'mongoose';
import { IReview } from './review.interface'; // Assuming you have a file for the interface
import { Product } from '../product/product.model';

const reviewSchema = new Schema<IReview>(
   {
      review: {
         type: String,
         required: [true, 'Review text is required.'],
         trim: true,
      },
      rating: {
         type: Number,
         required: [true, 'Rating is required.'],
         min: [1, 'Rating must be at least 1.'],
         max: [5, 'Rating cannot be greater than 5.'],
      },
      user: {
         type: Schema.Types.ObjectId,
         ref: 'User',
         required: true,
      },
      product: {
         type: Schema.Types.ObjectId,
         ref: 'Product',
         required: true,
      },
      isFlagged: {
         type: Boolean,
         default: false,
      },
      flaggedReason: {
         type: String,
         default: '',
      },
      isVerifiedPurchase: {
         type: Boolean,
         default: false,
      },
   },
   {
      timestamps: true,
   }
);

const updateProductRatings = async (productId: string) => {
   const reviews = await Review.aggregate([
      { $match: { product: productId } },
      {
         $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            ratingCount: { $sum: 1 },
         },
      },
   ]);

   const { averageRating = 0, ratingCount = 0 } = reviews[0] || {};

   await Product.findByIdAndUpdate(productId, {
      averageRating,
      ratingCount,
   });
};

reviewSchema.post('save', async function (doc) {
   await updateProductRatings(doc.product.toString());
});

reviewSchema.post('findOneAndDelete', async function (doc) {
   await updateProductRatings(doc.product.toString());
});

export const Review = model<IReview>('Review', reviewSchema);
