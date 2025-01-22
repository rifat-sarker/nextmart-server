import { Order } from '../order/order.model';

const getMetaData = async () => {
   const dailyOrder = await Order.aggregate([
      {
         $group: {
            _id: {
               $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
         },
      },
      {
         $sort: { _id: -1 },
      },
      {
         $limit: 7,
      },
   ]);
   const metaData = {
      dailyOrder,
   };

   return metaData;
};

export const MetaService = {
   getMetaData,
};
