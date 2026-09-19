import express from 'express';
import { db } from '../../src/db/index.ts';
import { users, businesses, businessMemberships, businessProfiles, listings, media, listingMedia, locations, listingLocations } from '../../src/db/schema.ts';
import { eq, and, sql } from 'drizzle-orm';
import { requestContextMiddleware } from '../middleware/context.ts';
import { authContextMiddleware, ensureSeedContext, SYSTEM_SEED_UID, SECONDARY_TEST_UID } from '../middleware/auth.ts';
import { apiRouter } from '../routes/api.ts';
import { businessService } from '../modules/businesses/businesses.service.ts';
import { listingService } from '../modules/listings/listings.service.ts';

async function runAudit() {
  console.log('=====================================================');
  console.log('🔍 RUNNING VERTICAL SLICE 02 TECHNICAL EVIDENCE AUDIT');
  console.log('=====================================================');

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(requestContextMiddleware);
  await ensureSeedContext();
  app.use(authContextMiddleware);
  app.use('/api/v1', apiRouter);

  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  const results: Record<string, any> = {};

  try {
    // -----------------------------------------------------------------
    // AUDIT SECTION 1: IDENTITY / AUTHENTICATION
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 1: IDENTITY / AUTHENTICATION ---');
    // 1.1 Development fallback
    const devRes = await fetch(`${baseUrl}/me`);
    const devJson = await devRes.json();
    console.log('1.1 GET /api/v1/me (Dev Fallback): Status', devRes.status, 'User:', devJson.data?.user?.name);
    results.identityDev = { status: devRes.status, user: devJson.data?.user?.uid, activeBiz: devJson.data?.activeBusinessId };

    // 1.2 Explicit user without business
    let [orphanUser] = await db.select().from(users).where(eq(users.uid, 'audit-orphan-user')).limit(1);
    if (!orphanUser) {
      [orphanUser] = await db.insert(users).values({
        uid: 'audit-orphan-user',
        name: 'کاربر بدون کارگاه',
        mobile: '09350001122',
        email: 'orphan@taropod.ir',
      }).returning();
    }
    const orphanRes = await fetch(`${baseUrl}/me`, {
      headers: { 'X-Actor-UID': 'audit-orphan-user' },
    });
    const orphanJson = await orphanRes.json();
    console.log('1.2 User without business: Status', orphanRes.status, 'activeBusinessId:', orphanJson.data?.activeBusinessId, 'Memberships length:', orphanJson.data?.memberships?.length);
    results.orphanAuth = { status: orphanRes.status, activeBusinessId: orphanJson.data?.activeBusinessId, membershipsCount: orphanJson.data?.memberships?.length };

    // 1.3 Production simulation (Missing credentials in production mode)
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const prodNoCredRes = await fetch(`${baseUrl}/me`);
    const prodNoCredJson = await prodNoCredRes.json();
    console.log('1.3 Production without credentials: Status', prodNoCredRes.status, 'Error:', prodNoCredJson.error?.code);
    results.prodNoCred = { status: prodNoCredRes.status, error: prodNoCredJson.error?.code };

    // 1.4 Production with malformed credentials
    const prodBadCredRes = await fetch(`${baseUrl}/me`, {
      headers: { Authorization: 'Bearer   ' },
    });
    const prodBadCredJson = await prodBadCredRes.json();
    console.log('1.4 Production with malformed Bearer: Status', prodBadCredRes.status, 'Error:', prodBadCredJson.error?.code);
    results.prodBadCred = { status: prodBadCredRes.status, error: prodBadCredJson.error?.code };

    // Restore env
    process.env.NODE_ENV = originalNodeEnv;

    // -----------------------------------------------------------------
    // AUDIT SECTION 2: BUSINESS CREATION TRANSACTION
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 2: BUSINESS CREATION TRANSACTION ---');
    const testSlug = `audit-biz-${Date.now()}`;
    const createBizRes = await fetch(`${baseUrl}/businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-UID': SYSTEM_SEED_UID,
      },
      body: JSON.stringify({
        name: 'کارگاه بافندگی آزمایشی آدیت',
        slug: testSlug,
        city: 'کاشان',
        province: 'اصفهان',
        description: 'واحد تخصصی فرش و بافندگی صنعتی',
        workshopAreaSqm: 800,
        activeMachinesCount: 22,
        personnelCount: 30,
      }),
    });
    const createBizJson = await createBizRes.json();
    console.log('2.1 POST /api/v1/businesses: Status', createBizRes.status, 'Created ID:', createBizJson.data?.business?.id);
    const createdBizId = createBizJson.data?.business?.id;

    // Verify atomic 3 parts in Postgres
    const [bizRow] = await db.select().from(businesses).where(eq(businesses.id, createdBizId));
    const [memRow] = await db.select().from(businessMemberships).where(eq(businessMemberships.businessId, createdBizId));
    const [profRow] = await db.select().from(businessProfiles).where(eq(businessProfiles.businessId, createdBizId));
    console.log('2.2 Atomicity verified in DB:', {
      businessExists: !!bizRow,
      ownerMembershipExists: !!memRow && memRow.role === 'owner',
      profileExists: !!profRow && profRow.workshopAreaSqm === 800,
    });
    results.atomicity = {
      biz: !!bizRow,
      memRole: memRow?.role,
      profileArea: profRow?.workshopAreaSqm,
    };

    // 2.3 Duplicate slug test
    const dupSlugRes = await fetch(`${baseUrl}/businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-UID': SYSTEM_SEED_UID,
      },
      body: JSON.stringify({
        name: 'کارگاه تکراری اسلاگ',
        slug: testSlug,
      }),
    });
    const dupSlugJson = await dupSlugRes.json();
    console.log('2.3 Duplicate slug 409 test: Status', dupSlugRes.status, 'Code:', dupSlugJson.error?.code);
    results.dupSlug = { status: dupSlugRes.status, code: dupSlugJson.error?.code };

    // -----------------------------------------------------------------
    // AUDIT SECTION 3: MEMBERSHIP AUTHORIZATION & CROSS-BUSINESS TEST
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 3: MEMBERSHIP AUTHORIZATION ---');
    // Secondary user (Alborz) tries to add member to Pars Dookht or newly created business
    const crossMemRes = await fetch(`${baseUrl}/businesses/${createdBizId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-UID': SECONDARY_TEST_UID, // User B has no membership in createdBizId
      },
      body: JSON.stringify({
        userId: orphanUser.id,
        role: 'operator',
      }),
    });
    const crossMemJson = await crossMemRes.json();
    console.log('3.1 Cross-business member mutation: Status', crossMemRes.status, 'Error:', crossMemJson.error?.code);
    results.crossMem = { status: crossMemRes.status, code: crossMemJson.error?.code };

    // Authorized owner adds member
    const authMemRes = await fetch(`${baseUrl}/businesses/${createdBizId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-UID': SYSTEM_SEED_UID, // Creator / Owner
      },
      body: JSON.stringify({
        userId: orphanUser.id,
        role: 'operator',
      }),
    });
    const authMemJson = await authMemRes.json();
    console.log('3.2 Authorized owner adds member: Status', authMemRes.status, 'Role:', authMemJson.data?.role);
    results.authMem = { status: authMemRes.status, role: authMemJson.data?.role };

    // -----------------------------------------------------------------
    // AUDIT SECTION 4: BUSINESS PROFILE & CROSS-BUSINESS GUARD
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 4: BUSINESS PROFILE ---');
    // Cross-business profile update attempt
    const crossProfRes = await fetch(`${baseUrl}/businesses/${createdBizId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-UID': SECONDARY_TEST_UID,
      },
      body: JSON.stringify({
        managerName: 'مهاجم غیرمجاز',
      }),
    });
    const crossProfJson = await crossProfRes.json();
    console.log('4.1 Cross-business profile update: Status', crossProfRes.status, 'Error:', crossProfJson.error?.code);
    results.crossProf = { status: crossProfRes.status, code: crossProfJson.error?.code };

    // Authorized profile update
    const authProfRes = await fetch(`${baseUrl}/businesses/${createdBizId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-UID': SYSTEM_SEED_UID,
      },
      body: JSON.stringify({
        managerName: 'مهندس کاشانی',
        workshopAreaSqm: 950,
      }),
    });
    const authProfJson = await authProfRes.json();
    console.log('4.2 Authorized profile update: Status', authProfRes.status, 'Updated managerName:', authProfJson.data?.profile?.managerName);
    results.authProf = { status: authProfRes.status, managerName: authProfJson.data?.profile?.managerName };

    // -----------------------------------------------------------------
    // AUDIT SECTION 5: LISTING OWNERSHIP & CROSS-BUSINESS MUTATION
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 5: LISTING OWNERSHIP ---');
    const [primarySeedBiz] = await db.select().from(businesses).where(eq(businesses.slug, 'pars-dookht'));
    const [secondarySeedBiz] = await db.select().from(businesses).where(eq(businesses.slug, 'alborz-spinning'));

    // Create draft listing for primary business
    const createDraftRes = await fetch(`${baseUrl}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-UID': SYSTEM_SEED_UID,
        'X-Business-ID': primarySeedBiz.id,
      },
      body: JSON.stringify({
        title: 'عرضه عمده نخ پنبه شانه شده نمره ۳۰ آدیت',
        description: 'تست ممیزی فنی و امنیت چندکسب‌وکاری',
        category: 'cmt-subcontracting',
        city: 'تهران',
        status: 'draft',
      }),
    });
    const createDraftJson = await createDraftRes.json();
    const draftListingId = createDraftJson.data?.id;
    console.log('5.1 Listing Draft created: ID', draftListingId, 'Status', createDraftRes.status);

    // Verify DB fields
    const [listingDb] = await db.select().from(listings).where(eq(listings.id, draftListingId));
    console.log('5.2 DB Persistence:', {
      businessId: listingDb.businessId,
      createdById: listingDb.createdById,
      isBusinessIdDistinctFromCreatorId: listingDb.businessId !== listingDb.createdById,
    });
    results.listingOwnership = {
      businessId: listingDb.businessId,
      createdById: listingDb.createdById,
      distinct: listingDb.businessId !== listingDb.createdById,
    };

    // Cross-business mutation attempt (Business B / Secondary User attempts to edit Business A draft)
    const crossEditRes = await fetch(`${baseUrl}/listings/${draftListingId}/draft`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-UID': SECONDARY_TEST_UID,
        'X-Business-ID': secondarySeedBiz.id,
      },
      body: JSON.stringify({
        title: 'تلاش غیرمجاز برای تغییر عنوان آگهی رقیب',
      }),
    });
    const crossEditJson = await crossEditRes.json();
    console.log('5.3 Cross-business mutation attempt: Status', crossEditRes.status, 'Error:', crossEditJson.error?.code);
    results.crossEdit = { status: crossEditRes.status, code: crossEditJson.error?.code };

    // -----------------------------------------------------------------
    // AUDIT SECTION 6: LISTING LIFECYCLE
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 6: LISTING LIFECYCLE ---');
    // 6.1 Update Draft
    const updateDraftRes = await fetch(`${baseUrl}/listings/${draftListingId}/draft`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-UID': SYSTEM_SEED_UID,
        'X-Business-ID': primarySeedBiz.id,
      },
      body: JSON.stringify({
        title: 'عرضه عمده نخ پنبه شانه شده نمره ۳۰ آدیت (ویرایش پیش‌نویس)',
        priceType: 'fixed',
        priceAmount: 185000,
      }),
    });
    const updateDraftJson = await updateDraftRes.json();
    console.log('6.1 Update Draft: Status', updateDraftRes.status, 'Updated title:', updateDraftJson.data?.title);

    // 6.2 Publish
    const publishRes = await fetch(`${baseUrl}/listings/${draftListingId}/publish`, {
      method: 'POST',
      headers: {
        'X-Actor-UID': SYSTEM_SEED_UID,
        'X-Business-ID': primarySeedBiz.id,
      },
    });
    const publishJson = await publishRes.json();
    console.log('6.2 Publish Command: Status', publishRes.status, 'Listing status:', publishJson.data?.status);

    // 6.3 Attempt invalid draft update after publish
    const postPublishEditRes = await fetch(`${baseUrl}/listings/${draftListingId}/draft`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-UID': SYSTEM_SEED_UID,
        'X-Business-ID': primarySeedBiz.id,
      },
      body: JSON.stringify({
        title: 'تلاش غیرمجاز پس از انتشار',
      }),
    });
    const postPublishEditJson = await postPublishEditRes.json();
    console.log('6.3 Attempt edit after publish: Status', postPublishEditRes.status, 'Error:', postPublishEditJson.error?.code);
    results.lifecycleGuard = { status: postPublishEditRes.status, code: postPublishEditJson.error?.code };

    // 6.4 Archive transition
    const archiveRes = await fetch(`${baseUrl}/listings/${draftListingId}/archive`, {
      method: 'POST',
      headers: {
        'X-Actor-UID': SYSTEM_SEED_UID,
        'X-Business-ID': primarySeedBiz.id,
      },
    });
    const archiveJson = await archiveRes.json();
    console.log('6.4 Archive Command: Status', archiveRes.status, 'Listing status:', archiveJson.data?.status);

    // 6.5 Attempt publish after archive
    const postArchivePublishRes = await fetch(`${baseUrl}/listings/${draftListingId}/publish`, {
      method: 'POST',
      headers: {
        'X-Actor-UID': SYSTEM_SEED_UID,
        'X-Business-ID': primarySeedBiz.id,
      },
    });
    const postArchivePublishJson = await postArchivePublishRes.json();
    console.log('6.5 Attempt publish after archive: Status', postArchivePublishRes.status, 'Error:', postArchivePublishJson.error?.code);
    results.archiveGuard = { status: postArchivePublishRes.status, code: postArchivePublishJson.error?.code };

    // Verify DB state
    const [finalDbListing] = await db.select().from(listings).where(eq(listings.id, draftListingId));
    console.log('6.6 Final DB State for Listing:', { status: finalDbListing.status, updatedAt: finalDbListing.updatedAt });
    results.finalDbStatus = finalDbListing.status;

    // -----------------------------------------------------------------
    // AUDIT SECTION 7: MEDIA RELATIONS
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 7: MEDIA RELATIONS ---');
    // Create new active listing for media test
    const [mediaTestListing] = await db.insert(listings).values({
      businessId: primarySeedBiz.id,
      createdById: primarySeedBiz.createdById,
      title: 'آگهی تست روابط رسانه',
      description: 'توضیحات تستی برای بررسی ارتباطات رسانه',
      categorySlug: 'cmt-subcontracting',
      city: 'تهران',
      province: 'تهران',
      status: 'draft',
    }).returning();

    // Attach Media 1 & Media 2
    const m1Url = 'https://images.unsplash.com/photo-test-1.jpg';
    const m2Url = 'https://images.unsplash.com/photo-test-2.jpg';

    const attachM1 = await fetch(`${baseUrl}/listings/${mediaTestListing.id}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Actor-UID': SYSTEM_SEED_UID, 'X-Business-ID': primarySeedBiz.id },
      body: JSON.stringify({ url: m1Url, isCover: true }),
    });
    const attachM2 = await fetch(`${baseUrl}/listings/${mediaTestListing.id}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Actor-UID': SYSTEM_SEED_UID, 'X-Business-ID': primarySeedBiz.id },
      body: JSON.stringify({ url: m2Url, isCover: false }),
    });
    console.log('7.1 Media attach status:', attachM1.status, attachM2.status);

    // Check DB relations
    const dbLinks = await db.select().from(listingMedia).where(eq(listingMedia.listingId, mediaTestListing.id));
    console.log('7.2 Media links in listing_media count:', dbLinks.length);

    // Detach M1
    const detachRes = await fetch(`${baseUrl}/listings/${mediaTestListing.id}/media/${encodeURIComponent(m1Url)}`, {
      method: 'DELETE',
      headers: { 'X-Actor-UID': SYSTEM_SEED_UID, 'X-Business-ID': primarySeedBiz.id },
    });
    console.log('7.3 Detach M1 status:', detachRes.status);

    const remainingLinks = await db.select().from(listingMedia).where(eq(listingMedia.listingId, mediaTestListing.id));
    const [unrelatedMedia] = await db.select().from(media).where(eq(media.url, m1Url));
    console.log('7.4 Remaining relations:', remainingLinks.length, 'Original media record preserved:', !!unrelatedMedia);
    results.mediaAudit = {
      attachedCount: dbLinks.length,
      remainingCount: remainingLinks.length,
      mediaRecordPreserved: !!unrelatedMedia,
    };

    // -----------------------------------------------------------------
    // AUDIT SECTION 8: LOCATION RELATIONS
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 8: LOCATION RELATIONS ---');
    const attachLocRes = await fetch(`${baseUrl}/listings/${mediaTestListing.id}/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Actor-UID': SYSTEM_SEED_UID, 'X-Business-ID': primarySeedBiz.id },
      body: JSON.stringify({
        title: 'کارگاه مرکزی جمهوری',
        city: 'تهران',
        province: 'تهران',
        latitude: 35.6997,
        longitude: 51.4085,
        addressDetails: 'پلاک ۴۲',
      }),
    });
    console.log('8.1 Attach Location Status:', attachLocRes.status);

    const locLinks = await db.select().from(listingLocations).where(eq(listingLocations.listingId, mediaTestListing.id));
    console.log('8.2 Attached listing_locations count:', locLinks.length);

    const detachLocRes = await fetch(`${baseUrl}/listings/${mediaTestListing.id}/location`, {
      method: 'DELETE',
      headers: { 'X-Actor-UID': SYSTEM_SEED_UID, 'X-Business-ID': primarySeedBiz.id },
    });
    console.log('8.3 Detach Location Status:', detachLocRes.status);

    const remainingLocLinks = await db.select().from(listingLocations).where(eq(listingLocations.listingId, mediaTestListing.id));
    console.log('8.4 Remaining location links:', remainingLocLinks.length);
    results.locationAudit = {
      attachedCount: locLinks.length,
      remainingCount: remainingLocLinks.length,
    };

    // -----------------------------------------------------------------
    // AUDIT SECTION 12: RATE LIMITING
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 12: RATE LIMITING ---');
    const rlRes = await fetch(`${baseUrl}/health`);
    console.log('12.1 Rate limit headers check:', {
      limit: rlRes.headers.get('ratelimit-limit') || rlRes.headers.get('x-ratelimit-limit'),
      remaining: rlRes.headers.get('ratelimit-remaining') || rlRes.headers.get('x-ratelimit-remaining'),
      reset: rlRes.headers.get('ratelimit-reset') || rlRes.headers.get('x-ratelimit-reset'),
    });
    results.rateLimitHeaders = {
      limit: rlRes.headers.get('ratelimit-limit') || rlRes.headers.get('x-ratelimit-limit'),
      remaining: rlRes.headers.get('ratelimit-remaining') || rlRes.headers.get('x-ratelimit-remaining'),
    };

    console.log('\n=====================================================');
    console.log('✅ ALL AUDIT OPERATIONS COMPLETED SUCCESSFULLY');
    console.log('=====================================================');
    console.log(JSON.stringify(results, null, 2));

  } finally {
    server.close();
  }
}

runAudit().then(() => process.exit(0)).catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
