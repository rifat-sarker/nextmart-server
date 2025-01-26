import { Order } from '../order/order.model';
import { PipelineStage } from 'mongoose';

const getMetaData = async () => {
   const startOfDay = new Date().setHours(0, 0, 0, 0);
   const endOfDay = new Date().setHours(23, 59, 59, 999);

   const todaysOrders = await Order.aggregate([
      {
         $match: {
            createdAt: {
               $gte: new Date(startOfDay),
               $lte: new Date(endOfDay),
            },
         },
      },
      {
         $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: '$finalAmount' },
         },
      },
      {
         $project: {
            _id: 0,
            totalOrders: 1,
            totalAmount: 1,
         },
      },
   ]);
   const bestProduct = await Order.aggregate([
      {
         $unwind: '$products',
      },
      {
         $lookup: {
            from: 'products',
            localField: 'products.product',
            foreignField: '_id',
            as: 'productDetails',
         },
      },
      {
         $group: {
            _id: '$productDetails._id',
            count: { $sum: '$products.quantity' },
            productName: { $first: '$productDetails.name' }, // Get the product name
         },
      },
      {
         $sort: {
            count: -1,
         },
      },
      {
         $limit: 1,
      },
      {
         $project: {
            _id: 0,
            productName: 1,
            count: 1,
         },
      },
   ]);

   const bestCategory = await Order.aggregate([
      { $unwind: '$products' },
      {
         $lookup: {
            from: 'products', // Product collection
            localField: 'products.product',
            foreignField: '_id',
            as: 'productDetails',
         },
      },
      { $unwind: '$productDetails' },
      {
         $group: {
            _id: '$productDetails.category',
            orderCount: { $sum: 1 },
         },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 1 },
      {
         $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryDetails',
         },
      },
      { $unwind: '$categoryDetails' },
      {
         $project: {
            _id: 0,
            categoryId: '$_id',
            categoryName: '$categoryDetails.name',
            orderCount: 1,
         },
      },
   ]);

   const bestBrand = await Order.aggregate([
      { $unwind: '$products' },
      {
         $lookup: {
            from: 'products', // Product collection
            localField: 'products.product',
            foreignField: '_id',
            as: 'productDetails',
         },
      },
      { $unwind: '$productDetails' },
      {
         $group: {
            _id: '$productDetails.brand',
            orderCount: { $sum: 1 },
         },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 1 },
      {
         $lookup: {
            from: 'brands',
            localField: '_id',
            foreignField: '_id',
            as: 'brandDetails',
         },
      },
      { $unwind: '$brandDetails' },
      {
         $project: {
            _id: 0,
            brandId: '$_id',
            brandName: '$brandDetails.name',
            orderCount: 1,
         },
      },
   ]);
   const bestShop = await Order.aggregate([
      {
         $group: {
            _id: '$shop',
            orderCount: { $sum: 1 },
         },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 1 },
      {
         $lookup: {
            from: 'shops',
            localField: '_id',
            foreignField: '_id',
            as: 'shopDetails',
         },
      },
      { $unwind: '$shopDetails' },
      {
         $project: {
            _id: 0,
            shopId: '$_id',
            shopName: '$shopDetails.shopName',
            orderCount: 1,
         },
      },
   ]);

   const orderStatuses = await Order.aggregate([
      {
         $group: {
            _id: '$status',
            count: { $sum: 1 },
         },
      },
   ]);

   return {
      todaysOrders,
      bestProduct,
      bestBrand,
      bestCategory,
      bestShop,
      orderStatuses,
   };
};

const getOrdersByDate = async (
   startDate: string,
   endDate?: string,
   groupBy?: string
) => {
   // Build date filter
   const matchStage: Record<string, any> = {};
   if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
         const start = new Date(startDate);
         start.setHours(0, 0, 0, 0);
         matchStage.createdAt.$gte = start;
      }

      if (endDate) {
         const end = new Date(endDate);
         end.setHours(23, 59, 59, 999);
         matchStage.createdAt.$lte = end;
      }
   }

   // Grouping stage
   let groupStage: Record<string, any> | null = null;
   switch (groupBy) {
      case 'day':
         groupStage = {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
         };
         break;
      case 'week':
         groupStage = {
            _id: { $week: '$createdAt' },
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
         };
         break;
      case 'month':
         groupStage = {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
         };
         break;
      case 'year':
         groupStage = {
            _id: { $year: '$createdAt' },
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
         };
         break;
      default:
         groupStage = null;
   }

   const pipeline: PipelineStage[] = [
      { $match: matchStage },
      ...(groupStage ? [{ $group: groupStage }] : []),
      { $sort: { _id: 1 } },
   ];

   const orders = await Order.aggregate(pipeline);
   return orders;
};

const getCustomerMetaData = async () => {
   const CustomerMetaInfo = await Order.aggregate([
      {
         $facet: {
            // Count total unique customers
            customerCount: [
               {
                  $group: { _id: '$user' },
               },
               {
                  $count: 'totalCustomers',
               },
            ],

            // Find new customers (only ordered once)
            newCustomer: [
               {
                  $group: {
                     _id: '$user',
                     orderCount: { $sum: 1 },
                  },
               },
               {
                  $match: { orderCount: 1 },
               },
               {
                  $count: 'newCustomers',
               },
            ],

            // Top 3 customers with the most orders
            topThreeMostOrderedCustomer: [
               {
                  $group: {
                     _id: '$user',
                     totalOrders: { $sum: 1 },
                  },
               },
               {
                  $lookup: {
                     from: 'users',
                     localField: '_id',
                     foreignField: '_id',
                     as: 'userDetails',
                  },
               },
               {
                  $unwind: '$userDetails',
               },
               {
                  $project: {
                     userId: '$_id',
                     userName: '$userDetails.name',
                     totalOrders: 1,
                  },
               },
               {
                  $sort: { totalOrders: -1 },
               },
               {
                  $limit: 3,
               },
            ],

            // Top 3 customers who spent the most
            topThreeMostSpendingCustomer: [
               {
                  $group: {
                     _id: '$user',
                     totalAmountSpent: { $sum: '$totalAmount' },
                  },
               },
               {
                  $lookup: {
                     from: 'users',
                     localField: '_id',
                     foreignField: '_id',
                     as: 'userDetails',
                  },
               },
               {
                  $unwind: '$userDetails',
               },
               {
                  $project: {
                     userId: '$_id',
                     userName: '$userDetails.name',
                     totalAmountSpent: 1,
                  },
               },
               {
                  $sort: { totalAmountSpent: -1 },
               },
               {
                  $limit: 3,
               },
            ],
         },
      },
   ]);

   return CustomerMetaInfo[0];
};

export const MetaService = {
   getMetaData,
   getOrdersByDate,
   getCustomerMetaData,
};
