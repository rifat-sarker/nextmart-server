import { Request, Response } from 'express';
import { brandService } from './brand.service';

export const brandController = {
  async getAll(req: Request, res: Response) {
    const data = await brandService.getAll();
    res.json(data);
  },
};
