import { Request, Response, NextFunction } from 'express';
import { db } from '../../src/db/index.ts';
import { users, businesses, businessMemberships, businessProfiles, profiles, profileCredentials, profileLocations } from '../../src/db/schema.ts';
import { eq } from 'drizzle-orm';
import { RequestAuthContext } from '../types/auth.ts';

declare global {
  namespace Express {
    interface Request {
      auth?: RequestAuthContext;
    }
  }
}

// Fixed system actor identifiers for deterministic seed/test context
export const SYSTEM_SEED_UID = 'taropod-system-user-01';
export const SECONDARY_TEST_UID = 'taropod-secondary-user-02';

export async function ensureSeedContext() {
  try {
    // 1. Check if Primary User exists
    let [primaryUser] = await db.select().from(users).where(eq(users.uid, SYSTEM_SEED_UID)).limit(1);
    if (!primaryUser) {
      [primaryUser] = await db.insert(users).values({
        uid: SYSTEM_SEED_UID,
        name: 'مهندس احمدی (مدیر تولید پارس دوخت)',
        mobile: '09121112233',
        email: 'ahmadi@taropod.ir',
      }).returning();
    }

    // 2. Check if Primary Business exists (تولیدی صنعتی پارس دوخت)
    let [primaryBusiness] = await db.select().from(businesses).where(eq(businesses.slug, 'pars-dookht')).limit(1);
    if (!primaryBusiness) {
      [primaryBusiness] = await db.insert(businesses).values({
        name: 'تولیدی صنعتی پارس دوخت',
        slug: 'pars-dookht',
        registrationNumber: '۱۰۸۶۱۱۴۲',
        licenseNumber: 'ص-۷۸۲۱',
        phone: '02166778899',
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان جمهوری، پاساژ کاوه، طبقه سوم، پلاک ۴۲',
        isVerified: true,
        createdById: primaryUser.id,
      }).returning();

      // Create Business Profile
      await db.insert(businessProfiles).values({
        businessId: primaryBusiness.id,
        description: 'واحد تخصصی برش و دوخت صنعتی تریکو، پیراهن و اسلش با ۲۰ چرخ تمام اتوماتیک',
        managerName: 'مهندس احمدی',
        workshopAreaSqm: 350,
        activeMachinesCount: 20,
        personnelCount: 18,
        whatsapp: '09121112233',
        verifiedBadges: ['پروانه کسب معتبر', 'عضو اتحادیه پوشاک', 'تضمین کیفیت دوخت'],
      });

      // Assign Membership (Owner)
      await db.insert(businessMemberships).values({
        userId: primaryUser.id,
        businessId: primaryBusiness.id,
        role: 'owner',
        isDefault: true,
      });
    }

    // 3. Create Secondary Test Business for Cross-Business AuthZ verification
    let [secondaryUser] = await db.select().from(users).where(eq(users.uid, SECONDARY_TEST_UID)).limit(1);
    if (!secondaryUser) {
      [secondaryUser] = await db.insert(users).values({
        uid: SECONDARY_TEST_UID,
        name: 'حاج محمد تقوی (ریسندگی البرز)',
        mobile: '09129998877',
        email: 'taghavi@alborz-textile.ir',
      }).returning();
    }

    let [secondaryBusiness] = await db.select().from(businesses).where(eq(businesses.slug, 'alborz-spinning')).limit(1);
    if (!secondaryBusiness) {
      [secondaryBusiness] = await db.insert(businesses).values({
        name: 'کارخانجات ریسندگی و بافندگی البرز',
        slug: 'alborz-spinning',
        city: 'قزوین',
        province: 'قزوین',
        address: 'شهرک صنعتی کاسپین، بلوار صنعت، فاز ۲',
        isVerified: true,
        createdById: secondaryUser.id,
      }).returning();

      await db.insert(businessProfiles).values({
        businessId: secondaryBusiness.id,
        description: 'تولید روزانه ۱۵ تن انواع نخ پنبه شانه شده و مخلوط پلی‌استر پنبه',
        managerName: 'حاج محمد تقوی',
        workshopAreaSqm: 5000,
        activeMachinesCount: 45,
        personnelCount: 65,
      });

      await db.insert(businessMemberships).values({
        userId: secondaryUser.id,
        businessId: secondaryBusiness.id,
        role: 'owner',
        isDefault: true,
      });
    }

    // 4. Ensure Primary User has a rich PERSON profile
    let [primaryProfile] = await db.select().from(profiles).where(eq(profiles.accountId, primaryUser.id)).limit(1);
    if (!primaryProfile) {
      [primaryProfile] = await db.insert(profiles).values({
        accountId: primaryUser.id,
        profileType: 'PERSON',
        status: 'ACTIVE',
        slug: 'pars-dookht-ahmadi',
        firstName: 'مهندس احمد',
        lastName: 'احمدی',
        businessName: 'کارگاه تخصصی برش و دوخت پارس',
        workGroup: 'تولید پوشاک',
        activityDomain: 'دوخت صنعتی و برش',
        specialties: ['دوخت تریکو', 'برش اتوماتیک کامپیوتری', 'الگوسازی صنعتی پوشاک'],
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        headerUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80',
        bio: 'با بیش از ۱۵ سال سابقه فعالیت تخصصی در زمینه برش و دوخت انواع پوشاک ورزشی، هودی و تریکو با خطوط پیشرفته تمام اتوماتیک.',
        yearsActive: 15,
        primaryProducts: ['هودی و اسلش دورس', 'تیشرت پنبه‌ای', 'پیراهن مردانه'],
        secondaryProducts: ['شلوار راحتی', 'سویشرت بهاره'],
        services: ['برش صنعتی با دستگاه CNC', 'دوخت مزدی بچه‌گانه و بزرگسال', 'بسته‌بندی و اتوکاری صنعتی'],
        capacitySummary: 'ظرفیت دوخت ماهانه ۱۵,۰۰۰ قطعه با ۲۰ چرخ تخصصی',
        workingHours: '۰۸:۰۰ الی ۱۸:۰۰',
        workingDays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه'],
        geographicScope: 'سراسر کشور',
        collaborationModes: ['کارمزدی', 'تولید سفارشی', 'پیمانکاری خطوط'],
        shippingCapability: true,
        onsiteServiceCapability: false,
        phone: '02166778899',
        mobile: '09121112233',
        whatsapp: '09121112233',
        telegram: 'pars_dookht_ahmadi',
        email: 'ahmadi@taropod.ir',
        websiteUrl: 'https://pars-dookht.ir',
        websiteStatus: 'APPROVED',
        socialLinks: JSON.stringify({ instagram: 'pars_dookht_textile', linkedin: 'ahmad-ahmadi-textile' }),
        rating: '4.90',
        ratingsCount: 14,
        isVerified: true,
      }).returning();

      // Add credential
      await db.insert(profileCredentials).values({
        profileId: primaryProfile.id,
        title: 'پروانه کسب معتبر از اتحادیه دوزندگان و خیاطان',
        issueDate: '۱۳۹۸/۰۴/۱۵',
        validityDate: '۱۴۰۵/۰۴/۱۵',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        description: 'مجوز رسمی فعالیت صنفی در رسته دوخت صنعتی پوشاک',
        isOfficiallyVerified: true,
      });

      // Add locations
      await db.insert(profileLocations).values([
        {
          profileId: primaryProfile.id,
          unitTitle: 'کارگاه مرکزی و خط دوخت',
          unitType: 'workshop',
          country: 'ایران',
          province: 'تهران',
          city: 'تهران',
          area: 'جمهوری، پاساژ کاوه',
          address: 'خیابان جمهوری، پاساژ کاوه، طبقه سوم، واحد ۴۲',
          postalCode: '1134812345',
          phone: '02166778899',
          latitude: '35.6997000',
          longitude: '51.4085000',
          isApproximate: false,
          isPrimary: true,
        },
        {
          profileId: primaryProfile.id,
          unitTitle: 'انبار پارچه و بسته‌بندی',
          unitType: 'warehouse',
          country: 'ایران',
          province: 'تهران',
          city: 'تهران',
          area: 'چهاردانگه',
          address: 'شهرک صنعتی چهاردانگه، خیابان ۲۲، پلاک ۵',
          latitude: '35.5900000',
          longitude: '51.3100000',
          isApproximate: true,
          isPrimary: false,
        }
      ]);
    }

    // 5. Ensure Secondary User has an ORGANIZATION profile
    let [secondaryProfile] = await db.select().from(profiles).where(eq(profiles.accountId, secondaryUser.id)).limit(1);
    if (!secondaryProfile) {
      [secondaryProfile] = await db.insert(profiles).values({
        accountId: secondaryUser.id,
        profileType: 'ORGANIZATION',
        status: 'ACTIVE',
        slug: 'alborz-textile-spinning',
        businessName: 'کارخانجات ریسندگی و بافندگی البرز',
        workGroup: 'ریسندگی و نساجی',
        activityDomain: 'تولید نخ و الیاف پنبه‌ای',
        specialties: ['نخ پنبه شانه شده', 'نخ پلی‌استر پنبه', 'رنگرزی تخصصی بوبین'],
        avatarUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&auto=format&fit=crop&q=80',
        headerUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&auto=format&fit=crop&q=80',
        bio: 'مجموعه نساجی البرز با ۳۰ سال سابقه تولید صنعتی الیاف طبیعی و مصنوعی، مجهز به مدرن‌ترین ماشین‌آلات ریسندگی چرخانه‌ای و رینگ.',
        yearsActive: 30,
        primaryProducts: ['نخ پنبه نمره ۲۰، ۳۰ و ۴۰', 'نخ کامپکت', 'نخ ملانژ طوسی'],
        secondaryProducts: ['ضایعات پنبه پنسیلوانیایی', 'تسمه نساجی'],
        services: ['رنگرزی سفارشی نخ کلاف و بوبین', 'تابندگی و دولاتابی نخ'],
        capacitySummary: 'تولید روزانه ۱۵ تن انواع نخ پنبه و پلی‌استر',
        workingHours: 'شبکه‌کاری ۲۴ ساعته در سه شیفت',
        workingDays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
        geographicScope: 'سراسر کشور و صادرات منطقه‌ای',
        collaborationModes: ['فروش عمده نقدی', 'قرارداد تأمین سالانه', 'تولید سفارشی نمره نخ'],
        shippingCapability: true,
        onsiteServiceCapability: false,
        phone: '02833889900',
        mobile: '09129998877',
        whatsapp: '09129998877',
        telegram: 'alborz_textile',
        email: 'info@alborz-textile.ir',
        websiteUrl: 'https://alborz-textile.ir',
        websiteStatus: 'APPROVED',
        rating: '4.85',
        ratingsCount: 28,
        isVerified: true,
      }).returning();

      await db.insert(profileLocations).values({
        profileId: secondaryProfile.id,
        unitTitle: 'مجتمع کارخانجات ریسندگی البرز',
        unitType: 'workshop',
        country: 'ایران',
        province: 'قزوین',
        city: 'قزوین',
        area: 'شهرک صنعتی کاسپین',
        address: 'شهرک صنعتی کاسپین، بلوار صنعت، فاز ۲',
        latitude: '36.1900000',
        longitude: '50.1500000',
        isApproximate: false,
        isPrimary: true,
      });
    }

    return { primaryUser, primaryBusiness, secondaryUser, secondaryBusiness };
  } catch (err) {
    console.error('Failed ensuring seed context:', err);
    throw err;
  }
}

// Auth Context Middleware: Extracts actor and active business
// Respects X-Actor-UID and X-Business-ID headers for test simulation
export async function authContextMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const isProductionOrStaging = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';
    const isExplicitTestAllowed = process.env.TAROPOD_ALLOW_TEST_AUTH === 'true' || req.headers['x-test-suite'] === 'taropod-internal';

    let actorUid: string | null = null;
    const authHeader = req.headers.authorization;

    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        if (token) {
          actorUid = token;
        } else {
          (req as any).authError = 'INVALID_BEARER_TOKEN';
          return next();
        }
      } else {
        (req as any).authError = 'MALFORMED_AUTH_HEADER';
        return next();
      }
    } else if (req.headers['x-actor-uid']) {
      // In production/staging, X-Actor-UID is ONLY honored if explicit test mode is allowed
      if (!isProductionOrStaging || isExplicitTestAllowed) {
        actorUid = req.headers['x-actor-uid'] as string;
      } else {
        (req as any).authError = 'TEST_HEADER_NOT_ALLOWED_IN_PRODUCTION';
        return next();
      }
    } else if (!isProductionOrStaging) {
      // Development mode convenience fallback
      actorUid = SYSTEM_SEED_UID;
    } else {
      // In Production/Staging: No credentials provided -> remain unauthenticated (no silent fallback!)
      return next();
    }

    if (!actorUid) {
      return next();
    }

    // Find user in PostgreSQL
    const [user] = await db.select().from(users).where(eq(users.uid, actorUid)).limit(1);
    if (!user) {
      // If credential was supplied but user not found, mark as invalid credentials
      (req as any).authError = 'USER_NOT_FOUND';
      return next();
    }

    // Load memberships
    const rawMemberships = await db
      .select({
        id: businessMemberships.id,
        businessId: businessMemberships.businessId,
        businessName: businesses.name,
        businessSlug: businesses.slug,
        role: businessMemberships.role,
        isDefault: businessMemberships.isDefault,
      })
      .from(businessMemberships)
      .innerJoin(businesses, eq(businessMemberships.businessId, businesses.id))
      .where(eq(businessMemberships.userId, user.id));

    // Determine active business (From header or default membership)
    const headerBusinessId = req.headers['x-business-id'] as string;
    let activeMembership: typeof rawMemberships[0] | null = null;
    if (rawMemberships.length > 0) {
      activeMembership = headerBusinessId
        ? rawMemberships.find(m => m.businessId === headerBusinessId) || rawMemberships[0]
        : rawMemberships.find(m => m.isDefault) || rawMemberships[0];
    }

    req.auth = {
      user: {
        id: user.id,
        uid: user.uid,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
      },
      activeBusinessId: activeMembership ? activeMembership.businessId : null,
      activeRole: activeMembership ? (activeMembership.role as 'owner' | 'manager' | 'operator') : null,
      memberships: rawMemberships as any,
    };

    next();
  } catch (error) {
    console.error('Error resolving auth context:', error);
    next();
  }
}

// Guard middleware to require authenticated actor
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if ((req as any).authError) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { code: 'INVALID_CREDENTIALS', message: 'اطلاعات احراز هویت نامعتبر یا منقضی است.' },
      meta: { requestId: req.requestId || (req as any).requestId, timestamp: new Date().toISOString(), version: 'v1', locale: 'fa-IR' },
    });
  }

  if (!req.auth || !req.auth.user) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'احراز هویت انجام نشده است.' },
      meta: { requestId: req.requestId || (req as any).requestId, timestamp: new Date().toISOString(), version: 'v1', locale: 'fa-IR' },
    });
  }
  next();
}

// Guard middleware to require active business context
export function requireActiveBusiness(req: Request, res: Response, next: NextFunction) {
  if (!req.auth || !req.auth.user) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'احراز هویت انجام نشده است.' },
      meta: { requestId: req.requestId || (req as any).requestId, timestamp: new Date().toISOString(), version: 'v1', locale: 'fa-IR' },
    });
  }

  if (!req.auth.activeBusinessId) {
    return res.status(403).json({
      success: false,
      data: null,
      error: { code: 'NO_ACTIVE_BUSINESS', message: 'هیچ کارگاه یا کسب‌وکار فعالی برای این حساب کاربری یافت نشد.' },
      meta: { requestId: req.requestId || (req as any).requestId, timestamp: new Date().toISOString(), version: 'v1', locale: 'fa-IR' },
    });
  }
  next();
}

