import { Request, Response } from 'express';
import { vendorService } from './vendor.service';

export const vendorController = {
  async getAll(req: Request, res: Response) {
    const data = await vendorService.getAll();
    res.json(data);
  },
};
