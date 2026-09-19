import { Router, Request, Response } from 'express';
import { locationsService } from './locations.service.ts';

export const locationsRouter = Router();

// GET /api/v1/locations/businesses - Get all business coordinates for map visualization
locationsRouter.get('/businesses', async (req: Request, res: Response) => {
  try {
    const businesses = await locationsService.getBusinessLocations();
    return res.apiSuccess({
      businesses,
      total: businesses.length,
    });
  } catch (err: any) {
    return res.apiError(
      err.statusCode || 500,
      err.code || 'LOCATIONS_ERROR',
      err.message || 'خطا در دریافت مختصات کسب‌وکارها'
    );
  }
});
