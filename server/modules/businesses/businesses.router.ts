import { Router, Request, Response } from 'express';
import { businessService } from './businesses.service.ts';
import { requireAuth } from '../../middleware/auth.ts';

export const businessesRouter = Router();

// POST /api/v1/businesses - Create new business with atomic owner membership (Slice 02)
businessesRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const auth = req.auth!;
    const { name, slug, city, province, phone, registrationNumber, licenseNumber, address, description, managerName, workshopAreaSqm, activeMachinesCount, personnelCount, whatsapp } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.apiError(422, 'VALIDATION_ERROR', 'نام کسب‌وکار یا کارگاه الزامی است.');
    }
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return res.apiError(422, 'VALIDATION_ERROR', 'شناسه یکتا (اسلاگ) کسب‌وکار الزامی است.');
    }

    const created = await businessService.createBusiness(auth.user, {
      name: name.trim(),
      slug: slug.trim(),
      city: city || 'تهران',
      province: province || 'تهران',
      phone,
      registrationNumber,
      licenseNumber,
      address,
      description,
      managerName,
      workshopAreaSqm: workshopAreaSqm !== undefined ? Number(workshopAreaSqm) : undefined,
      activeMachinesCount: activeMachinesCount !== undefined ? Number(activeMachinesCount) : undefined,
      personnelCount: personnelCount !== undefined ? Number(personnelCount) : undefined,
      whatsapp,
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
    if (error.message?.includes('DUPLICATE_SLUG')) {
      return res.apiError(409, 'DUPLICATE_SLUG', 'شناسه (اسلاگ) انتخاب شده تکراری است. لطفاً شناسه دیگری انتخاب کنید.');
    }
    if (error.message?.includes('INVALID_SLUG')) {
      return res.apiError(422, 'VALIDATION_ERROR', error.message);
    }
    console.error('Error creating business:', error);
    return res.apiError(500, 'BUSINESS_CREATION_FAILED', error.message || 'خطا در ثبت کسب‌وکار جدید.');
  }
});

// GET /api/v1/businesses/:id
businessesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || id.trim() === '') {
      return res.apiError(400, 'INVALID_PARAMETER', 'شناسه کسب‌وکار الزامی است.');
    }

    const business = await businessService.getBusinessById(id.trim());
    if (!business) {
      return res.apiError(404, 'BUSINESS_NOT_FOUND', 'کسب‌وکار مورد نظر یافت نشد.');
    }

    return res.apiSuccess(business);
  } catch (error) {
    console.error('Error fetching business:', error);
    return res.apiError(500, 'INTERNAL_ERROR', 'خطای سرور در بازیابی اطلاعات کسب‌وکار.');
  }
});

// GET /api/v1/businesses/:id/profile
businessesRouter.get('/:id/profile', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || id.trim() === '') {
      return res.apiError(400, 'INVALID_PARAMETER', 'شناسه کسب‌وکار الزامی است.');
    }

    const profile = await businessService.getProfileByBusinessId(id.trim());
    if (!profile) {
      return res.apiError(404, 'PROFILE_NOT_FOUND', 'پروفایل کسب‌وکار مورد نظر یافت نشد.');
    }

    return res.apiSuccess(profile);
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return res.apiError(500, 'INTERNAL_ERROR', 'خطای سرور در بازیابی پروفایل کسب‌وکار.');
  }
});

// PUT /api/v1/businesses/:id/profile - Create or update business profile (Slice 02)
const handleProfileUpdate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const auth = req.auth!;

    const updated = await businessService.updateProfile(auth, id.trim(), req.body);
    return res.apiSuccess(updated);
  } catch (error: any) {
    if (error.message === 'BUSINESS_NOT_FOUND') {
      return res.apiError(404, 'BUSINESS_NOT_FOUND', 'کسب‌وکار مورد نظر یافت نشد.');
    }
    if (error.message?.includes('FORBIDDEN')) {
      return res.apiError(403, 'FORBIDDEN', error.message);
    }
    console.error('Error updating business profile:', error);
    return res.apiError(500, 'UPDATE_PROFILE_FAILED', error.message || 'خطا در ذخیره پروفایل کسب‌وکار.');
  }
};

businessesRouter.put('/:id/profile', requireAuth, handleProfileUpdate);
businessesRouter.post('/:id/profile', requireAuth, handleProfileUpdate);

// POST /api/v1/businesses/:id/members - Add or update a business member (Slice 02)
businessesRouter.post('/:id/members', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const auth = req.auth!;
    const { userId, role } = req.body;

    if (!userId) {
      return res.apiError(422, 'VALIDATION_ERROR', 'شناسه کاربر عضو الزامی است.');
    }
    if (!role || !['owner', 'manager', 'operator'].includes(role)) {
      return res.apiError(422, 'VALIDATION_ERROR', 'نقش کاربری نامعتبر است (مجاز: owner, manager, operator).');
    }

    const membership = await businessService.addMember(auth, id.trim(), userId, role);
    return res.status(201).json({
      success: true,
      data: membership,
      error: null,
      meta: {
        requestId: (req as any).requestId,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  } catch (error: any) {
    if (error.message === 'BUSINESS_NOT_FOUND') {
      return res.apiError(404, 'BUSINESS_NOT_FOUND', 'کسب‌وکار مورد نظر یافت نشد.');
    }
    if (error.message?.includes('FORBIDDEN')) {
      return res.apiError(403, 'FORBIDDEN', error.message);
    }
    return res.apiError(500, 'ADD_MEMBER_FAILED', error.message || 'خطا در ثبت عضویت کارگاه.');
  }
});

// GET /api/v1/businesses/:id/members - List members of a business (Slice 02)
businessesRouter.get('/:id/members', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const auth = req.auth!;

    const members = await businessService.listMembers(auth, id.trim());
    return res.apiSuccess(members);
  } catch (error: any) {
    if (error.message === 'BUSINESS_NOT_FOUND') {
      return res.apiError(404, 'BUSINESS_NOT_FOUND', 'کسب‌وکار مورد نظر یافت نشد.');
    }
    if (error.message?.includes('FORBIDDEN')) {
      return res.apiError(403, 'FORBIDDEN', error.message);
    }
    return res.apiError(500, 'LIST_MEMBERS_FAILED', error.message || 'خطا در دریافت لیست اعضا.');
  }
});
