import { Router, Request, Response } from 'express';
import { exploreService } from './explore.service.ts';

export const exploreRouter = Router();

// GET /api/v1/explore - Filterable discovery endpoint
exploreRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      categorySlug,
      province,
      city,
      businessType,
      search,
      page,
      limit,
    } = req.query;

    const result = await exploreService.explore({
      categoryId: categoryId ? String(categoryId) : undefined,
      categorySlug: categorySlug ? String(categorySlug) : undefined,
      province: province ? String(province) : undefined,
      city: city ? String(city) : undefined,
      businessType: businessType ? String(businessType) : undefined,
      search: search ? String(search) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    return res.apiSuccess(result);
  } catch (err: any) {
    return res.apiError(
      err.statusCode || 500,
      err.code || 'EXPLORE_ERROR',
      err.message || 'خطا در جستجو و کاوش در بازارگاه'
    );
  }
});
