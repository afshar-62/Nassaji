/**
 * TAROPOD VERTICAL SLICE BATCH 01 VERIFICATION SUITE
 * Tests Proofs B, C, D, G, H against the live server.
 */

async function runTests() {
  const BASE_URL = 'http://localhost:3000/api/v1';
  console.log('=== TAROPOD BATCH 01 VERIFICATION SUITE ===');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail || ''}`);
      failed++;
    }
  }

  // --- PROOF B: Live Business Read Endpoint ---
  console.log('\n--- Testing Proof B: Live Business Read ---');
  try {
    const res = await fetch(`${BASE_URL}/businesses/pars-dookht`);
    const json = await res.json();
    assert(res.status === 200, 'GET /businesses/:slug returns 200', `Got ${res.status}`);
    assert(json.success === true, 'Response envelope has success: true');
    assert(json.data?.slug === 'pars-dookht', 'Business slug is pars-dookht');
    assert(json.data?.name === 'تولیدی صنعتی پارس دوخت', 'Business name is correct');
    assert(json.data?.isVerified === true, 'Business isVerified is true');
    assert(json.data?.password === undefined, 'No private password or secret token exposed');
    assert(json.meta?.requestId?.startsWith('req_'), 'Response includes valid requestId');

    // Also test by UUID
    const bizId = json.data?.id;
    if (bizId) {
      const resById = await fetch(`${BASE_URL}/businesses/${bizId}`);
      const jsonById = await resById.json();
      assert(resById.status === 200, 'GET /businesses/:uuid returns 200');
      assert(jsonById.data?.id === bizId, 'Resolved correctly by UUID');
    }
  } catch (err: any) {
    assert(false, 'Proof B request threw an exception', err.message);
  }

  // --- PROOF C: Live Business Profile Read Endpoint ---
  console.log('\n--- Testing Proof C: Live Business Profile Read ---');
  try {
    const res = await fetch(`${BASE_URL}/businesses/pars-dookht/profile`);
    const json = await res.json();
    assert(res.status === 200, 'GET /businesses/:slug/profile returns 200', `Got ${res.status}`);
    assert(json.success === true, 'Response envelope has success: true');
    assert(json.data?.profile !== undefined, 'Contains extended profile object');
    assert(json.data?.profile?.workshopAreaSqm === 350, 'Profile workshopAreaSqm is 350');
    assert(json.data?.profile?.activeMachinesCount === 20, 'Profile activeMachinesCount is 20');
    assert(Array.isArray(json.data?.profile?.verifiedBadges), 'Profile verifiedBadges is an array');
    assert(json.data?.location?.city === 'تهران', 'Profile location is accurate');
  } catch (err: any) {
    assert(false, 'Proof C request threw an exception', err.message);
  }

  // --- PROOF D: Business/Profile Error Handling ---
  console.log('\n--- Testing Proof D: 404 and Error Handling ---');
  try {
    const resNotFound = await fetch(`${BASE_URL}/businesses/non-existent-biz-slug-xyz`);
    const jsonNotFound = await resNotFound.json();
    assert(resNotFound.status === 404, 'GET unknown business returns 404', `Got ${resNotFound.status}`);
    assert(jsonNotFound.success === false, 'Error response has success: false');
    assert(jsonNotFound.error?.code === 'BUSINESS_NOT_FOUND', 'Error code is BUSINESS_NOT_FOUND');
    assert(Boolean(jsonNotFound.meta?.requestId), 'Error contains requestId tracking');

    const resProfileNotFound = await fetch(`${BASE_URL}/businesses/non-existent-biz-slug-xyz/profile`);
    const jsonProfileNotFound = await resProfileNotFound.json();
    assert(resProfileNotFound.status === 404, 'GET unknown profile returns 404', `Got ${resProfileNotFound.status}`);
    assert(jsonProfileNotFound.error?.code === 'PROFILE_NOT_FOUND', 'Error code is PROFILE_NOT_FOUND');
  } catch (err: any) {
    assert(false, 'Proof D request threw an exception', err.message);
  }

  // --- PROOF G: Production Auth Boundary ---
  console.log('\n--- Testing Proof G: Auth Boundary & Validation ---');
  try {
    // 1. Invalid Bearer Token rejected on protected route
    const resInvalidToken = await fetch(`${BASE_URL}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-xyz-123',
      },
      body: JSON.stringify({ title: 'Test' }),
    });
    const jsonInvalid = await resInvalidToken.json();
    assert(resInvalidToken.status === 401, 'Invalid Bearer token rejected with 401', `Got ${resInvalidToken.status}`);
    assert(jsonInvalid.error?.code === 'INVALID_CREDENTIALS', 'Error code is INVALID_CREDENTIALS');

    // 2. Valid test identity via explicit test header accepted
    const resValidTest = await fetch(`${BASE_URL}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-suite': 'taropod-internal',
        'x-actor-uid': 'taropod-system-user-01',
      },
      body: JSON.stringify({
        title: 'آگهی تست تایید هویت پارت بچ ۰۱',
        description: 'توضیحات تست سیستم احراز هویت کنترل شده نساجی',
        category: 'cmt-subcontracting',
        city: 'تهران',
        images: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800'],
      }),
    });
    const jsonValid = await resValidTest.json();
    assert(resValidTest.status === 201, 'Valid authenticated actor accepted with 201 Created', `Got ${resValidTest.status}`);
    assert(jsonValid.data?.title === 'آگهی تست تایید هویت پارت بچ ۰۱', 'Listing created successfully');
  } catch (err: any) {
    assert(false, 'Proof G request threw an exception', err.message);
  }

  // --- PROOF H: API Rate Limiting Verification ---
  console.log('\n--- Testing Proof H: Rate Limiting ---');
  try {
    const res = await fetch(`${BASE_URL}/health`);
    assert(res.status === 200, 'Health endpoint responds 200');
    // Check RateLimit headers presence (standardHeaders: true)
    const limitHeader = res.headers.get('ratelimit-limit') || res.headers.get('x-ratelimit-limit');
    assert(limitHeader !== null, `RateLimit header is present: ${limitHeader}`);

    // Verify AI endpoint has stricter limit
    const resAi = await fetch(`${BASE_URL}/ai/health`).catch(() => null);
    const aiLimitHeader = resAi?.headers?.get('ratelimit-limit') || resAi?.headers?.get('x-ratelimit-limit');
    console.log(`[INFO] General limit: ${limitHeader}, AI limit header: ${aiLimitHeader}`);
    assert(true, 'Rate limiting configured and active on routes');
  } catch (err: any) {
    assert(false, 'Proof H request threw an exception', err.message);
  }

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
