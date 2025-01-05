import { Request, Response } from 'express';
import { couponService } from './coupon.service';

export const couponController = {
  async getAll(req: Request, res: Response) {
    const data = await couponService.getAll();
    res.json(data);
  },
};
