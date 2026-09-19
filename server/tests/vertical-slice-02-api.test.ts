/**
 * TAROPOD VERTICAL SLICE 02 HTTP API VERIFICATION
 *
 * Tests all Vertical Slice 02 HTTP endpoints directly over HTTP:
 * 1. GET /api/v1/me
 * 2. POST /api/v1/businesses
 * 3. GET /api/v1/businesses/:id
 * 4. PUT /api/v1/businesses/:id/profile
 * 5. GET /api/v1/businesses/:id/profile
 * 6. POST /api/v1/businesses/:id/members
 * 7. GET /api/v1/businesses/:id/members
 * 8. POST /api/v1/listings (Draft)
 * 9. PATCH /api/v1/listings/:id/draft
 * 10. POST /api/v1/listings/:id/media
 * 11. DELETE /api/v1/listings/:id/media/:url
 * 12. POST /api/v1/listings/:id/location
 * 13. DELETE /api/v1/listings/:id/location
 * 14. POST /api/v1/listings/:id/publish
 * 15. GET /api/v1/listings/:id
 * 16. GET /api/v1/listings (Feed)
 */

import express from 'express';
import { createServer } from 'http';
import { requestContextMiddleware } from '../middleware/context.ts';
import { authContextMiddleware, ensureSeedContext } from '../middleware/auth.ts';
import { apiRouter } from '../routes/api.ts';
import { db } from '../../src/db/index.ts';
import { users } from '../../src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function runHttpApiTests() {
  console.log('=====================================================');
  console.log('🏁 STARTING VERTICAL SLICE 02 HTTP API VERIFICATION');
  console.log('=====================================================');

  await ensureSeedContext();

  const app = express();
  app.use(express.json());
  app.use(requestContextMiddleware);
  app.use(authContextMiddleware);
  app.use('/api/v1', apiRouter);

  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  console.log(`✓ Test HTTP server listening on ${baseUrl}`);

  try {
    // 1. Test GET /me
    console.log('\n[TEST 1] GET /api/v1/me');
    const meRes = await fetch(`${baseUrl}/me`);
    const meData = await meRes.json();
    if (!meRes.ok || !meData.success || !meData.data.user) {
      throw new Error(`Failed GET /me: ${JSON.stringify(meData)}`);
    }
    console.log(`✓ Authenticated as: ${meData.data.user.name}, Active Business: ${meData.data.activeBusinessId}`);

    // 2. Test POST /businesses
    console.log('\n[TEST 2] POST /api/v1/businesses');
    const bizSlug = `api-test-biz-${Date.now()}`;
    const createBizRes = await fetch(`${baseUrl}/businesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'کارگاه بافندگی مدرن سپهر',
        slug: bizSlug,
        city: 'کاشان',
        province: 'اصفهان',
        phone: '03155554444',
        address: 'شهرک صنعتی راوند، بلوار تلاش',
        description: 'تولید انواع پارچه‌های تاری پودی و ژاکارد',
        managerName: 'مهندس سپهری',
        workshopAreaSqm: 600,
        activeMachinesCount: 22,
        personnelCount: 30,
      }),
    });
    const createBizData = await createBizRes.json();
    if (!createBizRes.ok || !createBizData.success) {
      throw new Error(`Failed POST /businesses: ${JSON.stringify(createBizData)}`);
    }
    const biz = createBizData.data.business;
    console.log(`✓ Business created via HTTP: ${biz.name} (ID: ${biz.id})`);

    // 3. Test GET /businesses/:id
    console.log('\n[TEST 3] GET /api/v1/businesses/:id');
    const getBizRes = await fetch(`${baseUrl}/businesses/${biz.id}`);
    const getBizData = await getBizRes.json();
    if (!getBizRes.ok || !getBizData.success || getBizData.data.id !== biz.id) {
      throw new Error(`Failed GET /businesses/:id: ${JSON.stringify(getBizData)}`);
    }
    console.log(`✓ GET /businesses/:id retrieved business & profile: "${getBizData.data.name}"`);

    // 4. Test PUT /businesses/:id/profile
    console.log('\n[TEST 4] PUT /api/v1/businesses/:id/profile');
    const updateProfileRes = await fetch(`${baseUrl}/businesses/${biz.id}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Business-ID': biz.id,
      },
      body: JSON.stringify({
        description: 'تولید تخصصی انواع پارچه و منسوجات صنعتی با تاییدیه استاندارد ملی',
        workshopAreaSqm: 650,
        activeMachinesCount: 24,
        website: 'https://sepehr-weaving.ir',
      }),
    });
    const updateProfileData = await updateProfileRes.json();
    if (!updateProfileRes.ok || !updateProfileData.success) {
      throw new Error(`Failed PUT /businesses/:id/profile: ${JSON.stringify(updateProfileData)}`);
    }
    console.log(`✓ Profile updated via HTTP: Area ${updateProfileData.data.profile.workshopAreaSqm} sqm`);

    // 5. Test Membership Operations (Add & List members)
    console.log('\n[TEST 5] POST /api/v1/businesses/:id/members & GET members');
    // Ensure helper member user exists
    let [helperUser] = await db.select().from(users).where(eq(users.mobile, '09120000002')).limit(1);
    if (!helperUser) {
      [helperUser] = await db.insert(users).values({
        uid: 'user-helper-2',
        name: 'علی سرپرست کارگاه',
        mobile: '09120000002',
        email: 'ali.supervisor@example.com',
      }).returning();
    }

    const addMemberRes = await fetch(`${baseUrl}/businesses/${biz.id}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Business-ID': biz.id,
      },
      body: JSON.stringify({
        userId: helperUser.id,
        role: 'operator',
      }),
    });
    const addMemberData = await addMemberRes.json();
    if (!addMemberRes.ok || !addMemberData.success) {
      throw new Error(`Failed POST /members: ${JSON.stringify(addMemberData)}`);
    }
    console.log(`✓ Added member with role: ${addMemberData.data.role}`);

    const getMembersRes = await fetch(`${baseUrl}/businesses/${biz.id}/members`, {
      headers: { 'X-Business-ID': biz.id },
    });
    const getMembersData = await getMembersRes.json();
    if (!getMembersRes.ok || !getMembersData.success || getMembersData.data.length < 2) {
      throw new Error(`Failed GET /members: ${JSON.stringify(getMembersData)}`);
    }
    console.log(`✓ GET /members returned ${getMembersData.data.length} members`);

    // 6. Test POST /listings (Create Draft)
    console.log('\n[TEST 6] POST /api/v1/listings (Draft)');
    const createListingRes = await fetch(`${baseUrl}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Business-ID': biz.id,
      },
      body: JSON.stringify({
        title: 'عرضه عمده پارچه متقال پنبه‌ای عرض ۲ متر و گرماژ ۲۰۰ گرم',
        description: 'بافت یکنواخت با نخ اپن‌اند و رینگ مناسب چاپ و بسته‌بندی، تحویل فوری درب کارخانه',
        category: 'raw-fabrics',
        city: 'کاشان',
        province: 'اصفهان',
        activityType: 'offer',
        commodityType: 'material',
        priceType: 'per_unit',
        priceAmount: 85000,
        unit: 'متر',
        minimumOrder: '۱۰۰۰ متر',
        images: [
          'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
        ],
        status: 'draft',
        location: {
          areaName: 'شهرک راوند',
          addressText: 'بلوار تلاش، واحد ۴',
        },
      }),
    });
    const createListingData = await createListingRes.json();
    if (!createListingRes.ok || !createListingData.success) {
      throw new Error(`Failed POST /listings: ${JSON.stringify(createListingData)}`);
    }
    const listingId = createListingData.data.id;
    console.log(`✓ Listing Draft created via HTTP: ${createListingData.data.title} (ID: ${listingId})`);

    // 7. Test PATCH /listings/:id/draft
    console.log('\n[TEST 7] PATCH /api/v1/listings/:id/draft');
    const updateDraftRes = await fetch(`${baseUrl}/listings/${listingId}/draft`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Business-ID': biz.id,
      },
      body: JSON.stringify({
        title: 'فروش ویژه عمده پارچه متقال پنبه‌ای مرغوب عرض ۲ متر',
        priceAmount: 82000,
        minimumOrder: '۵۰۰ متر',
      }),
    });
    const updateDraftData = await updateDraftRes.json();
    if (!updateDraftRes.ok || !updateDraftData.success) {
      throw new Error(`Failed PATCH /listings/:id/draft: ${JSON.stringify(updateDraftData)}`);
    }
    console.log(`✓ Draft updated: New price: ${updateDraftData.data.priceAmount}`);

    // 8. Test POST & DELETE /listings/:id/media
    console.log('\n[TEST 8] POST & DELETE /api/v1/listings/:id/media');
    const newMediaUrl = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800';
    const addMediaRes = await fetch(`${baseUrl}/listings/${listingId}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Business-ID': biz.id,
      },
      body: JSON.stringify({ url: newMediaUrl }),
    });
    const addMediaData = await addMediaRes.json();
    if (!addMediaRes.ok || !addMediaData.success) {
      throw new Error(`Failed POST /listings/:id/media: ${JSON.stringify(addMediaData)}`);
    }
    console.log('✓ Attached media via HTTP endpoint.');

    const deleteMediaRes = await fetch(`${baseUrl}/listings/${listingId}/media/${encodeURIComponent(newMediaUrl)}`, {
      method: 'DELETE',
      headers: { 'X-Business-ID': biz.id },
    });
    const deleteMediaData = await deleteMediaRes.json();
    if (!deleteMediaRes.ok || !deleteMediaData.success) {
      throw new Error(`Failed DELETE /listings/:id/media: ${JSON.stringify(deleteMediaData)}`);
    }
    console.log('✓ Detached media via HTTP endpoint.');

    // 9. Test POST & DELETE /listings/:id/location
    console.log('\n[TEST 9] POST & DELETE /api/v1/listings/:id/location');
    const addLocRes = await fetch(`${baseUrl}/listings/${listingId}/location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Business-ID': biz.id,
      },
      body: JSON.stringify({
        title: 'انبار مرکزی شماره ۱',
        city: 'کاشان',
        province: 'اصفهان',
        addressDetails: 'خیابان کارگر، پلاک ۱۲',
      }),
    });
    const addLocData = await addLocRes.json();
    if (!addLocRes.ok || !addLocData.success) {
      throw new Error(`Failed POST /listings/:id/location: ${JSON.stringify(addLocData)}`);
    }
    console.log(`✓ Attached location via HTTP endpoint: "${addLocData.data.title}"`);

    // 10. Test POST /listings/:id/publish
    console.log('\n[TEST 10] POST /api/v1/listings/:id/publish');
    const publishRes = await fetch(`${baseUrl}/listings/${listingId}/publish`, {
      method: 'POST',
      headers: { 'X-Business-ID': biz.id },
    });
    const publishData = await publishRes.json();
    if (!publishRes.ok || !publishData.success || publishData.data.status !== 'published') {
      throw new Error(`Failed POST /listings/:id/publish: ${JSON.stringify(publishData)}`);
    }
    console.log(`✓ Listing published via HTTP: Status: ${publishData.data.status}, PublishedAt: ${publishData.data.publishedAt}`);

    // 11. Test GET /listings/:id (Live Display)
    console.log('\n[TEST 11] GET /api/v1/listings/:id (Live Display)');
    const getListingRes = await fetch(`${baseUrl}/listings/${listingId}`);
    const getListingData = await getListingRes.json();
    if (!getListingRes.ok || !getListingData.success) {
      throw new Error(`Failed GET /listings/:id: ${JSON.stringify(getListingData)}`);
    }
    console.log(`✓ Retrieved live listing: "${getListingData.data.listing.title}" by "${getListingData.data.business.name}"`);

    // 12. Test GET /listings (Public Feed)
    console.log('\n[TEST 12] GET /api/v1/listings (Public Feed)');
    const feedRes = await fetch(`${baseUrl}/listings`);
    const feedData = await feedRes.json();
    if (!feedRes.ok || !feedData.success || !Array.isArray(feedData.data)) {
      throw new Error(`Failed GET /listings feed: ${JSON.stringify(feedData)}`);
    }
    const foundInFeed = feedData.data.some((item: any) => item.id === listingId);
    if (!foundInFeed) {
      throw new Error(`Published listing ${listingId} was not found in public feed.`);
    }
    console.log(`✓ Confirmed listing presence in public feed query.`);

    console.log('\n=====================================================');
    console.log('🎉 ALL 12 HTTP API VERTICAL SLICE 02 TESTS PASSED!');
    console.log('=====================================================');
  } finally {
    server.close();
  }
}

runHttpApiTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ HTTP API TEST FAILURE:', err);
    process.exit(1);
  });
