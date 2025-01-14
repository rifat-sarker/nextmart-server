import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { IImageFile, IImageFiles } from "../../interface/IImageFile";
import { IJwtPayload } from "../auth/auth.interface";
import User from "../user/user.model";
import { IProduct } from "./product.interface";
import { Category } from "../category/category.model";
import { Product } from "./product.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { ProductSearchableFields } from "./product.constant";
import { Order } from "../order/order.model";
import Shop from "../shop/shop.model";

const createProduct = async (
  productData: Partial<IProduct>,
  productImages: IImageFiles,
  authUser: IJwtPayload
) => {
  const { images } = productImages;
  if (!images || images.length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Product images are required.');
  }

  productData.imageUrls = images.map((image) => image.path);

  const isUserExists = await User.checkUserExist(authUser.userId);
  if (!isUserExists.hasShop) {
    throw new AppError(StatusCodes.BAD_REQUEST, "You don't have a shop!");
  }

  const shop = await Shop.findOne({ user: isUserExists._id });
  if (!shop) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Shop does not exist!");
  }

  if (!shop.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Your shop is not active!');
  }

  const isCategoryExists = await Category.findById(productData.category);
  if (!isCategoryExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Category does not exist!");
  }

  if (!isCategoryExists.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Category is not active!");
  }

  const newProduct = new Product({
    ...productData,
    shop: shop._id,
  });

  const result = await newProduct.save();
  return result;
};

// const getAllProduct = async (query: Record<string, unknown>) => {
//   const { minPrice, maxPrice, ...pQuery } = query;
//   const productQuery = new QueryBuilder(Product.find().populate('category shop brand'), pQuery)
//     .search(ProductSearchableFields)
//     .filter()
//     .sort()
//     .paginate()
//     .fields()
//     .priceRange(Number(minPrice) || 0, Number(maxPrice) || Infinity);

//   const products = await Product.aggregate([
//     {
//       $match: productQuery.modelQuery,  // Use the query built by QueryBuilder
//     },
//     {
//       $lookup: {
//         from: "flashsales", // Join with FlashSale collection to calculate offer price
//         let: { productId: "$_id" },
//         pipeline: [
//           { $match: { $expr: { $in: ["$$productId", "$products.productId"] }, isActive: true } },
//           { $unwind: "$products" },
//           { $match: { $expr: { $eq: ["$$productId", "$products.productId"] } } },
//           {
//             $project: {
//               discountPercentage: "$products.discountPercentage",
//             },
//           },
//         ],
//         as: "flashSale",
//       },
//     },
//     {
//       $addFields: {
//         offerPrice: {
//           $cond: {
//             if: { $gt: [{ $size: "$flashSale" }, 0] },
//             then: {
//               $subtract: [
//                 "$price",
//                 { $multiply: [{ $arrayElemAt: ["$flashSale.discountPercentage", 0] }, 0.01] },
//               ],
//             },
//             else: "$price",
//           },
//         },
//       },
//     },
//     {
//       $project: {
//         name: 1,
//         slug: 1,
//         price: 1,
//         stock: 1,
//         offerPrice: 1,
//         category: 1,
//         shop: 1,
//         brand: 1,
//         imageUrls: 1,
//         isActive: 1,
//         averageRating: 1,
//         ratingCount: 1,
//         availableColors: 1,
//         specification: 1,
//         keyFeatures: 1,
//       },
//     },
//   ]);

//   // Step 3: Return paginated results with meta data
//   const totalCount = await Product.countDocuments(productQuery.modelQuery);

//   return {
//     meta: { totalCount },
//     result: products,
//   };
// }

const getAllProduct = async (query: Record<string, unknown>) => {
  const { minPrice, maxPrice, ...pQuery } = query;

  const productQuery = new QueryBuilder(Product.find()
    .populate('category', 'name')
    .populate('shop', 'name')
    .populate('brand', 'name'), pQuery)
    .search(['name', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .priceRange(Number(minPrice) || 0, Number(maxPrice) || Infinity);

  const products = await productQuery.modelQuery.lean();

  const productsWithOfferPrice = await Promise.all(products.map(async (product) => {
    const productDoc = await Product.findById(product._id);
    const offerPrice = await productDoc?.offerPrice;
    return {
      ...product,
      offerPrice: Number(offerPrice) || null,
    };
  }));

  const meta = await productQuery.countTotal();

  return {
    meta,
    result: productsWithOfferPrice,
  };
};


const getTrendingProducts = async (limit: number) => {
  const now = new Date();
  const last30Days = new Date(now.setDate(now.getDate() - 30));

  const trendingProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: last30Days },
      },
    },
    {
      $unwind: "$products",
    },
    {
      $group: {
        _id: "$products.product",
        orderCount: { $sum: "$products.quantity" },
      },
    },
    {
      $sort: { orderCount: -1 },
    },
    {
      $limit: limit || 10,
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: "$productDetails",
    },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        orderCount: 1,
        name: "$productDetails.name",
        price: "$productDetails.price",
        offer: "$productDetails.offer",
        imageUrls: "$productDetails.imageUrls",
      },
    },
  ]);

  return trendingProducts;
};


export const ProductService = {
  createProduct,
  getAllProduct,
  getTrendingProducts
}