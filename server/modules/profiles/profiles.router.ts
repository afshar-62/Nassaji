import { Router, Request, Response } from 'express';
import { profilesService, DomainError } from './profiles.service.ts';
import { requireAuth } from '../../middleware/auth.ts';

export const profilesRouter = Router();

// GET /api/v1/profiles/me - Retrieve current user's profile (Owner DTO)
profilesRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const accountId = req.auth!.user.id;
    const profile = await profilesService.getOwnerProfile(accountId);
    return res.apiSuccess(profile);
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.apiError(error.statusCode, error.code, error.message);
    }
    console.error('Error fetching owner profile:', error);
    return res.apiError(500, 'INTERNAL_SERVER_ERROR', 'خطا در بارگذاری اطلاعات پروفایل کاربری.');
  }
});

// POST /api/v1/profiles - Create new professional profile (PERSON or ORGANIZATION)
profilesRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const accountId = req.auth!.user.id;
    const body = req.body || {};

    if (!body.workGroup || typeof body.workGroup !== 'string' || body.workGroup.trim() === '') {
      return res.apiError(422, 'VALIDATION_ERROR', 'انتخاب گروه کاری برای پروفایل الزامی است.');
    }
    if (!body.activityDomain || typeof body.activityDomain !== 'string' || body.activityDomain.trim() === '') {
      return res.apiError(422, 'VALIDATION_ERROR', 'انتخاب شاخه یا حوزه فعالیت الزامی است.');
    }
    if (!Array.isArray(body.specialties) || body.specialties.length === 0) {
      return res.apiError(422, 'VALIDATION_ERROR', 'ثبت حداقل یک تخصص برای پروفایل الزامی است.');
    }

    const created = await profilesService.createProfile(accountId, body);
    return res.apiSuccess(created, {}, 201);
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.apiError(error.statusCode, error.code, error.message);
    }
    console.error('Error creating profile:', error);
    return res.apiError(500, 'PROFILE_CREATION_FAILED', error.message || 'خطا در ایجاد پروفایل جدید.');
  }
});

// PATCH /api/v1/profiles/me - Update current user's profile (Idempotent autosave/manual update)
profilesRouter.patch('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const accountId = req.auth!.user.id;
    const body = req.body || {};
    const updated = await profilesService.updateOwnerProfile(accountId, body);
    return res.apiSuccess(updated);
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.apiError(error.statusCode, error.code, error.message);
    }
    console.error('Error updating owner profile:', error);
    return res.apiError(500, 'PROFILE_UPDATE_FAILED', error.message || 'خطا در به‌روزرسانی اطلاعات پروفایل.');
  }
});

// POST /api/v1/profiles/me/credentials - Add credential / certificate / license
profilesRouter.post('/me/credentials', requireAuth, async (req: Request, res: Response) => {
  try {
    const accountId = req.auth!.user.id;
    const body = req.body || {};
    const cred = await profilesService.addCredential(accountId, body);
    return res.apiSuccess(cred, {}, 201);
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.apiError(error.statusCode, error.code, error.message);
    }
    console.error('Error adding profile credential:', error);
    return res.apiError(500, 'CREDENTIAL_ADD_FAILED', error.message || 'خطا در ثبت مدرک اعتباری.');
  }
});

// DELETE /api/v1/profiles/me/credentials/:id - Remove credential
profilesRouter.delete('/me/credentials/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const accountId = req.auth!.user.id;
    const credentialId = req.params.id;
    const success = await profilesService.removeCredential(accountId, credentialId);
    if (!success) {
      return res.apiError(404, 'NOT_FOUND', 'مدرک مورد نظر یافت نشد.');
    }
    return res.apiSuccess({ removed: true });
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.apiError(error.statusCode, error.code, error.message);
    }
    console.error('Error removing profile credential:', error);
    return res.apiError(500, 'CREDENTIAL_REMOVE_FAILED', error.message || 'خطا در حذف مدرک اعتباری.');
  }
});

// POST /api/v1/profiles/me/locations - Add operational unit / location
profilesRouter.post('/me/locations', requireAuth, async (req: Request, res: Response) => {
  try {
    const accountId = req.auth!.user.id;
    const body = req.body || {};
    const loc = await profilesService.addLocation(accountId, body);
    return res.apiSuccess(loc, {}, 201);
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.apiError(error.statusCode, error.code, error.message);
    }
    console.error('Error adding profile location:', error);
    return res.apiError(500, 'LOCATION_ADD_FAILED', error.message || 'خطا در ثبت موقعیت واحد.');
  }
});

// DELETE /api/v1/profiles/me/locations/:id - Remove operational unit / location
profilesRouter.delete('/me/locations/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const accountId = req.auth!.user.id;
    const locationId = req.params.id;
    const success = await profilesService.removeLocation(accountId, locationId);
    if (!success) {
      return res.apiError(404, 'NOT_FOUND', 'واحد موقعیت مکانی مورد نظر یافت نشد.');
    }
    return res.apiSuccess({ removed: true });
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.apiError(error.statusCode, error.code, error.message);
    }
    console.error('Error removing profile location:', error);
    return res.apiError(500, 'LOCATION_REMOVE_FAILED', error.message || 'خطا در حذف واحد موقعیت.');
  }
});

// POST /api/v1/profiles/:id/ratings - Submit star score (Meaningful interaction required)
profilesRouter.post('/:id/ratings', requireAuth, async (req: Request, res: Response) => {
  try {
    const raterAccountId = req.auth!.user.id;
    const profileId = req.params.id;
    const body = req.body || {};

    const result = await profilesService.rateProfile(profileId, raterAccountId, body);
    return res.apiSuccess(result, {}, 201);
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.apiError(error.statusCode, error.code, error.message);
    }
    console.error('Error rating profile:', error);
    return res.apiError(500, 'RATING_FAILED', error.message || 'خطا در ثبت امتیاز پروفایل.');
  }
});

// POST /api/v1/profiles/:id/events - Record interaction observability event
profilesRouter.post('/:id/events', async (req: Request, res: Response) => {
  try {
    const profileId = req.params.id;
    const actorId = req.auth?.user?.id || '00000000-0000-0000-0000-000000000000';
    const { eventType, metadata } = req.body || {};

    if (!eventType) {
      return res.apiError(422, 'VALIDATION_ERROR', 'نوع رویداد الزامی است.');
    }

    await profilesService.recordInteractionEvent(
      profileId,
      actorId,
      eventType,
      typeof metadata === 'object' ? JSON.stringify(metadata) : metadata
    );
    return res.apiSuccess({ recorded: true });
  } catch (error: any) {
    console.error('Error recording profile event:', error);
    return res.apiSuccess({ recorded: false }); // Soft fail for analytics
  }
});

// GET /api/v1/profiles/:id - Public Profile DTO by ID or Slug
profilesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const idOrSlug = req.params.id;
    const profile = await profilesService.getPublicProfile(idOrSlug);
    return res.apiSuccess(profile);
  } catch (error: any) {
    if (error instanceof DomainError) {
      return res.apiError(error.statusCode, error.code, error.message);
    }
    console.error('Error fetching public profile:', error);
    return res.apiError(500, 'INTERNAL_SERVER_ERROR', 'خطا در بارگذاری اطلاعات پروفایل.');
  }
});
