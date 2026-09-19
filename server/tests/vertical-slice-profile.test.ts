import { describe, it } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import express from 'express';
import { apiRouter } from '../routes/api.ts';
import { requestContextMiddleware } from '../middleware/context.ts';
import { authContextMiddleware, ensureSeedContext, SECONDARY_TEST_UID } from '../middleware/auth.ts';
import { db } from '../../src/db/index.ts';
import { users, profiles } from '../../src/db/schema.ts';
import { eq } from 'drizzle-orm';

// Helper for making typed HTTP requests
async function request(
  server: http.Server,
  method: string,
  path: string,
  options: {
    headers?: Record<string, string>;
    body?: any;
  } = {}
): Promise<{ status: number; body: any }> {
  const address = server.address() as any;
  const port = address.port;
  const url = `http://127.0.0.1:${port}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const init: RequestInit = {
    method,
    headers,
  };

  if (options.body) {
    init.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, init);
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

async function runTests() {
  console.log('=====================================================');
  console.log('🏁 STARTING TAROPOD PROFILE VERTICAL SLICE (v0.1) TESTS');
  console.log('=====================================================');

  // 1. Initialize Seed Context
  console.log('\n[SETUP] Ensuring seed context in PostgreSQL...');
  const seed = await ensureSeedContext();
  assert.ok(seed.primaryUser, 'Primary user must exist');
  assert.ok(seed.secondaryUser, 'Secondary user must exist');
  console.log('✓ Seed context verified.');

  // 2. Setup Express test server with real middlewares
  const app = express();
  app.use(express.json());
  app.use(requestContextMiddleware);
  app.use(authContextMiddleware);
  app.use('/api/v1', apiRouter);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as any).port;
  console.log(`✓ Test HTTP server listening on http://127.0.0.1:${port}/api/v1`);

  try {
    // TEST 1: GET /api/v1/profiles/me for Primary User (Owner DTO)
    console.log('\n[TEST 1] GET /api/v1/profiles/me (Owner DTO)...');
    const meRes = await request(server, 'GET', '/api/v1/profiles/me');
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.body.success, true);
    const ownerProfile = meRes.body.data;
    assert.ok(ownerProfile, 'Owner profile must be returned');
    assert.strictEqual(ownerProfile.profileType, 'PERSON');
    assert.strictEqual(ownerProfile.isOwner, true);
    assert.ok(ownerProfile.accountId, 'Owner DTO must contain accountId');
    assert.ok(ownerProfile.baseline, 'Owner DTO must contain baseline validation');
    assert.strictEqual(ownerProfile.baseline.isComplete, true);
    assert.strictEqual(ownerProfile.status, 'ACTIVE');
    assert.ok(Array.isArray(ownerProfile.specialties), 'Specialties must be an array');
    assert.ok(ownerProfile.specialties.length >= 1, 'At least 1 specialty required');
    console.log(`✓ Owner profile retrieved: ${ownerProfile.displayName} (Slug: ${ownerProfile.slug})`);

    // TEST 2: GET /api/v1/profiles/:id or :slug (Public DTO)
    console.log('\n[TEST 2] GET /api/v1/profiles/:slug (Public DTO Security)...');
    const publicRes = await request(server, 'GET', `/api/v1/profiles/${ownerProfile.slug}`);
    assert.strictEqual(publicRes.status, 200);
    assert.strictEqual(publicRes.body.success, true);
    const publicProfile = publicRes.body.data;
    assert.strictEqual(publicProfile.id, ownerProfile.id);
    assert.strictEqual(publicProfile.accountId, undefined, 'Public DTO must NEVER leak accountId');
    assert.strictEqual(publicProfile.isOwner, undefined, 'Public DTO must not leak internal isOwner flag');
    assert.strictEqual(publicProfile.baseline, undefined, 'Public DTO must not leak internal baseline object');
    assert.ok(publicProfile.contacts, 'Public DTO should contain contacts');
    assert.ok(Array.isArray(publicProfile.credentials), 'Credentials must be an array');
    assert.ok(Array.isArray(publicProfile.locations), 'Locations must be an array');
    console.log(`✓ Public profile successfully verified without leaking accountId.`);

    // TEST 3: Enforce "هر Account در MVP حداکثر یک PERSONAL Profile دارد"
    console.log('\n[TEST 3] Enforcing at most one PERSON profile per account...');
    const duplicatePersonRes = await request(server, 'POST', '/api/v1/profiles', {
      body: {
        profileType: 'PERSON',
        firstName: 'تست',
        lastName: 'دوم',
        workGroup: 'تولید پوشاک',
        activityDomain: 'دوخت صنعتی',
        specialties: ['دوخت'],
      },
    });
    assert.strictEqual(duplicatePersonRes.status, 409);
    assert.strictEqual(duplicatePersonRes.body.error.code, 'ACCOUNT_ALREADY_HAS_PERSONAL_PROFILE');
    console.log('✓ Successfully rejected creation of second PERSON profile for same account (409 Conflict).');

    // TEST 4: Baseline Validation on New Profile (Missing required fields)
    console.log('\n[TEST 4] Testing baseline validation for incomplete profile...');
    // Create a new distinct test user
    const [testUser3] = await db.insert(users).values({
      uid: 'taropod-test-user-03',
      name: 'کاربر تستی شماره ۳',
      mobile: '09127778899',
    }).returning();

    const incompleteRes = await request(server, 'POST', '/api/v1/profiles', {
      headers: {
        'x-actor-uid': 'taropod-test-user-03',
        'x-test-suite': 'taropod-internal',
      },
      body: {
        profileType: 'PERSON',
        firstName: '',
        lastName: '',
        workGroup: 'تولید پوشاک',
        activityDomain: 'طراحی',
        specialties: [], // Empty specialties violates validation
      },
    });
    assert.strictEqual(incompleteRes.status, 422, 'Empty specialties must be rejected with 422');
    console.log('✓ Baseline validation correctly rejected empty specialties.');

    // TEST 5: Create Draft Profile with missing identity fields (INCOMPLETE status)
    console.log('\n[TEST 5] Create Profile as INCOMPLETE draft...');
    const draftRes = await request(server, 'POST', '/api/v1/profiles', {
      headers: {
        'x-actor-uid': 'taropod-test-user-03',
        'x-test-suite': 'taropod-internal',
      },
      body: {
        profileType: 'PERSON',
        firstName: '', // Missing name
        lastName: '',
        workGroup: 'بافندگی',
        activityDomain: 'گردبافی',
        specialties: ['بافت دورس'],
      },
    });
    assert.strictEqual(draftRes.status, 201);
    assert.strictEqual(draftRes.body.data.status, 'INCOMPLETE', 'Profile with missing name must be INCOMPLETE');
    assert.strictEqual(draftRes.body.data.baseline.isComplete, false);
    console.log('✓ Incomplete profile created with status INCOMPLETE and baseline report.');

    // TEST 6: PATCH /api/v1/profiles/me - Completing baseline advances status to ACTIVE
    console.log('\n[TEST 6] Completing baseline via PATCH /me...');
    const completeRes = await request(server, 'PATCH', '/api/v1/profiles/me', {
      headers: {
        'x-actor-uid': 'taropod-test-user-03',
        'x-test-suite': 'taropod-internal',
      },
      body: {
        firstName: 'حمید',
        lastName: 'کریمی',
        businessName: 'بافندگی کریمی',
        bio: 'تولیدکننده تخصصی انواع پارچه گردباف',
        capacitySummary: 'ظرفیت بافت روزانه ۱ تن پارچه',
        workingHours: '۰۷:۰۰ الی ۱۹:۰۰',
        workingDays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه'],
        collaborationModes: ['کارمزدی', 'فروش طاقه‌ای'],
        shippingCapability: true,
      },
    });
    assert.strictEqual(completeRes.status, 200);
    assert.strictEqual(completeRes.body.data.status, 'ACTIVE');
    assert.strictEqual(completeRes.body.data.baseline.isComplete, true);
    assert.strictEqual(completeRes.body.data.firstName, 'حمید');
    assert.strictEqual(completeRes.body.data.lastName, 'کریمی');
    console.log('✓ Profile updated and status transitioned to ACTIVE.');

    // TEST 7: Credentials & Evidence Management (No fake official verification)
    console.log('\n[TEST 7] Adding credential evidence (strictly unverified unless official)...');
    const credRes = await request(server, 'POST', '/api/v1/profiles/me/credentials', {
      headers: {
        'x-actor-uid': 'taropod-test-user-03',
        'x-test-suite': 'taropod-internal',
      },
      body: {
        title: 'گواهینامه فنی بافندگی تریکو',
        issueDate: '۱۴۰۱/۰۶/۱۰',
        fileUrl: 'https://example.com/certificate.pdf',
        description: 'دوره بین‌المللی بافت ماشین‌آلات مایر اند سیه',
      },
    });
    assert.strictEqual(credRes.status, 201);
    assert.strictEqual(credRes.body.data.isOfficiallyVerified, false, 'Evidence MUST NOT be marked officially verified');
    const credentialId = credRes.body.data.id;
    console.log('✓ Credential added with isOfficiallyVerified: false.');

    // TEST 8: Locations & Units Management (No fake city-center coordinates)
    console.log('\n[TEST 8] Adding professional location with explicit approximate coordinates...');
    const locRes = await request(server, 'POST', '/api/v1/profiles/me/locations', {
      headers: {
        'x-actor-uid': 'taropod-test-user-03',
        'x-test-suite': 'taropod-internal',
      },
      body: {
        unitTitle: 'کارگاه گردبافی شماره ۱',
        unitType: 'workshop',
        country: 'ایران',
        province: 'تهران',
        city: 'اسلامشهر',
        address: 'شهرک صنعتی چهاردانگه، خیابان ۲۲',
        latitude: null, // Coordinates unknown -> return null, isApproximate: true
        longitude: null,
        isApproximate: true,
        isPrimary: true,
      },
    });
    assert.strictEqual(locRes.status, 201);
    assert.strictEqual(locRes.body.data.latitude, null, 'Coordinates must be null if unknown');
    assert.strictEqual(locRes.body.data.isApproximate, true, 'isApproximate must be true');
    console.log('✓ Location added without fake coordinates (latitude: null, isApproximate: true).');

    // TEST 9: Ratings - Self-rating prevention
    console.log('\n[TEST 9] Preventing self-rating...');
    const selfRateRes = await request(server, 'POST', `/api/v1/profiles/${completeRes.body.data.id}/ratings`, {
      headers: {
        'x-actor-uid': 'taropod-test-user-03',
        'x-test-suite': 'taropod-internal',
      },
      body: {
        score: 5,
        interactionType: 'deal',
      },
    });
    assert.strictEqual(selfRateRes.status, 400);
    assert.strictEqual(selfRateRes.body.error.code, 'SELF_RATING_NOT_ALLOWED');
    console.log('✓ Self-rating successfully blocked (400 SELF_RATING_NOT_ALLOWED).');

    // TEST 10: Ratings - Reject non-meaningful interaction (e.g. profile_view)
    console.log('\n[TEST 10] Rejecting rating from non-meaningful interaction (profile_view)...');
    const invalidRateRes = await request(server, 'POST', `/api/v1/profiles/${completeRes.body.data.id}/ratings`, {
      // Primary user rates test user 3
      body: {
        score: 5,
        interactionType: 'profile_view',
      },
    });
    assert.strictEqual(invalidRateRes.status, 400);
    assert.strictEqual(invalidRateRes.body.error.code, 'INVALID_INTERACTION_FOR_RATING');
    console.log('✓ Rating from profile_view successfully rejected.');

    // TEST 11: Ratings - Submit valid rating with meaningful interaction (deal)
    console.log('\n[TEST 11] Submitting valid rating with meaningful interaction (deal)...');
    const validRateRes = await request(server, 'POST', `/api/v1/profiles/${completeRes.body.data.id}/ratings`, {
      body: {
        score: 4,
        interactionType: 'deal',
        privateRationale: 'معامله خرید طاقه پارچه تریکو با کیفیت عالی و تحویل سروقت انجام شد.',
      },
    });
    assert.strictEqual(validRateRes.status, 201);
    assert.strictEqual(validRateRes.body.data.rating, 4);
    assert.strictEqual(validRateRes.body.data.ratingsCount, 1);
    console.log('✓ Rating submitted: 4 stars. Aggregate updated.');

    // TEST 12: Verify Public DTO does NOT leak private rationale
    console.log('\n[TEST 12] Verifying public profile does NOT leak private ratings rationale...');
    const finalPublic = await request(server, 'GET', `/api/v1/profiles/${completeRes.body.data.id}`);
    assert.strictEqual(finalPublic.status, 200);
    assert.strictEqual(finalPublic.body.data.rating, 4);
    assert.strictEqual(finalPublic.body.data.ratingsCount, 1);
    const serialized = JSON.stringify(finalPublic.body);
    assert.ok(!serialized.includes('معامله خرید طاقه پارچه'), 'Private rationale must NEVER be exposed in public API');
    console.log('✓ Verified: Private rating rationale is strictly hidden from public response.');

    // Clean up test records
    await db.delete(profiles).where(eq(profiles.id, completeRes.body.data.id));
    await db.delete(users).where(eq(users.id, testUser3.id));

    console.log('\n=====================================================');
    console.log('🎉 ALL 12 PROFILE VERTICAL SLICE SPECIFICATIONS PASSED!');
    console.log('=====================================================');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
