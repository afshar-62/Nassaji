import { Router, Request, Response } from 'express';
import { CreateListingSchema, UpdateDraftSchema, QueryListingsSchema } from './listings.schema.ts';
import { listingService } from './listings.service.ts';
import { requireAuth } from '../../middleware/auth.ts';

export const listingsRouter = Router();

// GET /api/v1/listings - Public feed query
listingsRouter.get('/', async (req: Request, res: Response) => {
  const queryResult = QueryListingsSchema.safeParse(req.query);
  if (!queryResult.success) {
    return res.apiError(400, 'INVALID_QUERY_PARAMS', 'پارامترهای جستجو معتبر نیستند', queryResult.error.flatten());
  }

  const { category, city, page, limit } = queryResult.data;
  const offset = (page - 1) * limit;

  try {
    const feed = await listingService.getFeed({
      categorySlug: category,
      city,
      limit,
      offset,
    });

    return res.apiSuccess(feed, {
      page,
      limit,
      total: feed.length,
      hasMore: feed.length === limit,
    });
  } catch (error: any) {
    console.error('Error fetching listings feed:', error);
    return res.apiError(500, 'INTERNAL_DATABASE_ERROR', 'خطا در واکشی آگهی‌های پایگاه داده');
  }
});

// GET /api/v1/listings/:id - Detailed listing by ID
listingsRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await listingService.getById(id);
    if (!result) {
      return res.apiError(404, 'NOT_FOUND', 'آگهی مورد نظر در سامانه یافت نشد');
    }
    return res.apiSuccess(result);
  } catch (error: any) {
    console.error('Error fetching listing by ID:', error);
    return res.apiError(500, 'INTERNAL_DATABASE_ERROR', 'خطا در واکشی اطلاعات آگهی');
  }
});

// POST /api/v1/listings - Create Draft or Published Listing (Enforces Business Ownership)
listingsRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const auth = req.auth!;
  if (!auth.activeBusinessId) {
    return res.apiError(403, 'NO_ACTIVE_BUSINESS', 'برای ثبت آگهی، باید یک کارگاه یا کسب‌وکار فعال انتخاب شده باشد.');
  }

  const parseResult = CreateListingSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.apiError(422, 'VALIDATION_ERROR', 'داده‌های ورودی ثبت آگهی نامعتبر است', parseResult.error.flatten().fieldErrors);
  }

  const data = parseResult.data;

  try {
    const created = await listingService.createDraft({
      businessId: auth.activeBusinessId,
      createdById: auth.user.id,
      categorySlug: data.category,
      title: data.title,
      description: data.description,
      activityType: data.activityType,
      commodityType: data.commodityType,
      priceType: data.priceType,
      priceAmount: data.priceAmount,
      unit: data.unit,
      minimumOrder: data.minimumOrder,
      city: data.city,
      province: data.province,
      status: data.status,
      mediaUrls: data.images,
      location: data.location ? {
        title: data.location.areaName || data.city,
        city: data.city,
        province: data.province || 'تهران',
        latitude: data.location.lat,
        longitude: data.location.lng,
        addressDetails: data.location.addressText,
      } : undefined,
    });

    return res.status(201).json({
      success: true,
      data: created,
      error: null,
      meta: {
        requestId: (req as any).requestId,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  } catch (error: any) {
    console.error('Error creating listing:', error);
    return res.apiError(500, 'DATABASE_INSERTION_FAILED', error.message || 'خطا در ثبت آگهی در پایگاه داده');
  }
});

// Helper for draft update
const handleDraftUpdate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const auth = req.auth!;
  if (!auth.activeBusinessId) {
    return res.apiError(403, 'NO_ACTIVE_BUSINESS', 'برای ویرایش آگهی، کارگاه فعال الزامی است.');
  }

  const parseResult = UpdateDraftSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.apiError(422, 'VALIDATION_ERROR', 'داده‌های ویرایش پیش‌نویس نامعتبر است', parseResult.error.flatten().fieldErrors);
  }

  const data = parseResult.data;

  try {
    const updated = await listingService.updateDraft(id, auth.activeBusinessId, {
      title: data.title,
      description: data.description,
      activityType: data.activityType,
      commodityType: data.commodityType,
      priceType: data.priceType,
      priceAmount: data.priceAmount,
      unit: data.unit,
      minimumOrder: data.minimumOrder,
      city: data.city,
      province: data.province,
      mediaUrls: data.images,
      location: data.location ? {
        title: data.location.areaName || data.city || 'تهران',
        city: data.city || 'تهران',
        province: data.province || 'تهران',
        latitude: data.location.lat,
        longitude: data.location.lng,
        addressDetails: data.location.addressText,
      } : undefined,
    });

    if (!updated) {
      return res.apiError(404, 'NOT_FOUND_OR_FORBIDDEN', 'آگهی پیش‌نویس یافت نشد یا به این کارگاه تعلق ندارد.');
    }
    return res.apiSuccess(updated);
  } catch (error: any) {
    if (error.message?.includes('INVALID_LIFECYCLE_STATE')) {
      return res.apiError(409, 'INVALID_LIFECYCLE_STATE', error.message);
    }
    return res.apiError(500, 'UPDATE_FAILED', error.message || 'خطا در ویرایش پیش‌نویس');
  }
};

// PATCH /api/v1/listings/:id/draft - Update Draft Listing
listingsRouter.patch('/:id/draft', requireAuth, handleDraftUpdate);
// PATCH /api/v1/listings/:id - Update Draft Listing (Alias)
listingsRouter.patch('/:id', requireAuth, handleDraftUpdate);

// POST /api/v1/listings/:id/media - Attach media to listing (Slice 02)
listingsRouter.post('/:id/media', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const auth = req.auth!;
  if (!auth.activeBusinessId) {
    return res.apiError(403, 'NO_ACTIVE_BUSINESS', 'کارگاه فعال الزامی است.');
  }

  const { url, isCover } = req.body;
  if (!url || typeof url !== 'string') {
    return res.apiError(422, 'VALIDATION_ERROR', 'آدرس تصویر (url) الزامی است.');
  }

  try {
    const result = await listingService.attachMedia(id, auth.activeBusinessId, url, auth.user.id, !!isCover);
    return res.status(201).json({
      success: true,
      data: result,
      error: null,
      meta: { requestId: (req as any).requestId, timestamp: new Date().toISOString(), version: 'v1' },
    });
  } catch (error: any) {
    return res.apiError(500, 'MEDIA_ATTACH_FAILED', error.message || 'خطا در افزودن تصویر.');
  }
});

// DELETE /api/v1/listings/:id/media/:mediaIdOrUrl - Detach media from listing (Slice 02)
listingsRouter.delete('/:id/media/:mediaIdOrUrl', requireAuth, async (req: Request, res: Response) => {
  const { id, mediaIdOrUrl } = req.params;
  const auth = req.auth!;
  if (!auth.activeBusinessId) {
    return res.apiError(403, 'NO_ACTIVE_BUSINESS', 'کارگاه فعال الزامی است.');
  }

  try {
    const success = await listingService.detachMedia(id, auth.activeBusinessId, decodeURIComponent(mediaIdOrUrl));
    return res.apiSuccess({ detached: success });
  } catch (error: any) {
    return res.apiError(500, 'MEDIA_DETACH_FAILED', error.message || 'خطا در حذف تصویر.');
  }
});

// POST /api/v1/listings/:id/location - Attach location to listing (Slice 02)
listingsRouter.post('/:id/location', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const auth = req.auth!;
  if (!auth.activeBusinessId) {
    return res.apiError(403, 'NO_ACTIVE_BUSINESS', 'کارگاه فعال الزامی است.');
  }

  const { title, city, province, latitude, longitude, addressDetails } = req.body;
  if (!city) {
    return res.apiError(422, 'VALIDATION_ERROR', 'نام شهر برای ثبت موقعیت مکانی الزامی است.');
  }

  try {
    const loc = await listingService.attachLocation(id, auth.activeBusinessId, {
      title,
      city,
      province: province || 'تهران',
      latitude: latitude !== undefined ? Number(latitude) : undefined,
      longitude: longitude !== undefined ? Number(longitude) : undefined,
      addressDetails,
    });
    return res.status(201).json({
      success: true,
      data: loc,
      error: null,
      meta: { requestId: (req as any).requestId, timestamp: new Date().toISOString(), version: 'v1' },
    });
  } catch (error: any) {
    return res.apiError(500, 'LOCATION_ATTACH_FAILED', error.message || 'خطا در ثبت موقعیت مکانی.');
  }
});

// DELETE /api/v1/listings/:id/location - Detach location from listing (Slice 02)
listingsRouter.delete('/:id/location', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const auth = req.auth!;
  if (!auth.activeBusinessId) {
    return res.apiError(403, 'NO_ACTIVE_BUSINESS', 'کارگاه فعال الزامی است.');
  }

  try {
    const success = await listingService.detachLocation(id, auth.activeBusinessId);
    return res.apiSuccess({ detached: success });
  } catch (error: any) {
    return res.apiError(500, 'LOCATION_DETACH_FAILED', error.message || 'خطا در حذف موقعیت مکانی.');
  }
});

// POST /api/v1/listings/:id/publish - Command to publish listing
listingsRouter.post('/:id/publish', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const auth = req.auth!;
  if (!auth.activeBusinessId) {
    return res.apiError(403, 'NO_ACTIVE_BUSINESS', 'برای انتشار آگهی، کارگاه فعال الزامی است.');
  }

  try {
    const published = await listingService.publish(id, auth.activeBusinessId);
    if (!published) {
      return res.apiError(404, 'NOT_FOUND_OR_FORBIDDEN', 'آگهی یافت نشد یا شما دسترسی انتشار آن را ندارید.');
    }
    return res.apiSuccess(published);
  } catch (error: any) {
    if (error.message?.includes('INVALID_LIFECYCLE_STATE')) {
      return res.apiError(409, 'INVALID_LIFECYCLE_STATE', error.message);
    }
    return res.apiError(500, 'PUBLISH_FAILED', error.message || 'خطا در انتشار آگهی');
  }
});

// POST /api/v1/listings/:id/archive - Command to archive listing
listingsRouter.post('/:id/archive', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const auth = req.auth!;

  try {
    const archived = await listingService.archive(id, auth.activeBusinessId);
    if (!archived) {
      return res.apiError(404, 'NOT_FOUND_OR_FORBIDDEN', 'آگهی یافت نشد یا شما دسترسی بایگانی آن را ندارید.');
    }
    return res.apiSuccess(archived);
  } catch (error: any) {
    return res.apiError(500, 'ARCHIVE_FAILED', error.message || 'خطا در بایگانی آگهی');
  }
});

// POST /api/v1/listings/:id/suspend - Command to suspend listing
listingsRouter.post('/:id/suspend', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const auth = req.auth!;

  try {
    const suspended = await listingService.suspend(id, auth.activeBusinessId);
    if (!suspended) {
      return res.apiError(404, 'NOT_FOUND_OR_FORBIDDEN', 'آگهی یافت نشد یا شما دسترسی تعلیق آن را ندارید.');
    }
    return res.apiSuccess(suspended);
  } catch (error: any) {
    return res.apiError(500, 'SUSPEND_FAILED', error.message || 'خطا در تعلیق آگهی');
  }
});
