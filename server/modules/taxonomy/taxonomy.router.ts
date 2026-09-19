import { Router, Request, Response } from 'express';
import { taxonomyService } from './taxonomy.service.ts';

export const taxonomyRouter = Router();

// GET /api/v1/categories/tree - Hierarchical category tree
taxonomyRouter.get('/tree', async (req: Request, res: Response) => {
  try {
    const onlyActive = req.query.active !== 'false';
    const tree = await taxonomyService.getCategoryTree(onlyActive);
    return res.apiSuccess({
      tree,
      totalRoots: tree.length,
    });
  } catch (err: any) {
    return res.apiError(
      err.statusCode || 500,
      err.code || 'INTERNAL_ERROR',
      err.message || 'خطا در دریافت ساختار درختی دسته‌بندی‌ها'
    );
  }
});

// GET /api/v1/categories - Flat list of categories with optional filtering
taxonomyRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { parentId, active } = req.query;
    const options: any = {};

    if (parentId !== undefined) {
      options.parentId = parentId === 'null' || parentId === '' ? null : String(parentId);
    }
    if (active !== undefined) {
      options.isActive = active === 'true';
    }

    const categories = await taxonomyService.getCategories(options);
    return res.apiSuccess({
      categories,
      total: categories.length,
    });
  } catch (err: any) {
    return res.apiError(
      err.statusCode || 500,
      err.code || 'INTERNAL_ERROR',
      err.message || 'خطا در دریافت فهرست دسته‌بندی‌ها'
    );
  }
});

// GET /api/v1/categories/:slug - Lookup single category by slug
taxonomyRouter.get('/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const category = await taxonomyService.getCategoryBySlug(slug);
    return res.apiSuccess(category);
  } catch (err: any) {
    return res.apiError(
      err.statusCode || 404,
      err.code || 'CATEGORY_NOT_FOUND',
      err.message || 'دسته‌بندی مورد نظر یافت نشد'
    );
  }
});
