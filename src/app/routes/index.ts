import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { CategoryRoutes } from '../modules/category/category.routes';
import { ProductRoutes } from '../modules/product/product.routes';
import { OrderRoutes } from '../modules/order/order.routes';
import { CouponRoutes } from '../modules/coupon/coupon.routes';
import { SSLRoutes } from '../modules/sslcommerz/sslcommerz.routes';
import { BrandRoutes } from '../modules/brand/brand.routes';
const router = Router();

const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes,
    },
    {
        path: '/auth',
        route: AuthRoutes,
    },
    {
        path: '/category',
        route: CategoryRoutes,
    },
    {
        path: '/brand',
        route: BrandRoutes,
    },
    {
        path: '/product',
        route: ProductRoutes,
    },
    {
        path: '/order',
        route: OrderRoutes,
    },
    {
        path: '/coupon',
        route: CouponRoutes,
    },
    {
        path: '/ssl',
        route: SSLRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;