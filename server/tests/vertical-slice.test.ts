/**
 * TAROPOD VERTICAL SLICE INTEGRATION TEST SUITE
 * 
 * Verifies the 3 core proofs from the Blueprint:
 * 1. Restart Persistence (Writes to DB, reads from fresh DB query)
 * 2. Cross-Business Authorization Guard (Business B cannot mutate Business A's listing)
 * 3. Invalid Lifecycle State Transition Guard (Only draft can be edited, invalid status transition rejected)
 */

import { listingRepository } from '../modules/listings/listings.repository.postgres.ts';
import { ensureSeedContext } from '../middleware/auth.ts';
import { db } from '../../src/db/index.ts';
import { listings, listingMedia, listingLocations } from '../../src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function runVerticalSliceTests() {
  console.log('=====================================================');
  console.log('🏁 STARTING TAROPOD VERTICAL SLICE PROOF VERIFICATION');
  console.log('=====================================================');

  // Step 1: Ensure deterministic seed actors
  console.log('\n[TEST 1] Ensuring Seed Context (Users & Businesses)...');
  const context = await ensureSeedContext();
  const businessA = context.primaryBusiness;
  const userA = context.primaryUser;
  const businessB = context.secondaryBusiness;
  const userB = context.secondaryUser;

  console.log(`✓ Business A: "${businessA.name}" (ID: ${businessA.id})`);
  console.log(`✓ Business B: "${businessB.name}" (ID: ${businessB.id})`);

  // Step 2: Create Draft Listing for Business A
  console.log('\n[TEST 2] Creating Draft Listing for Business A...');
  const draft = await listingRepository.createDraft({
    businessId: businessA.id,
    createdById: userA.id,
    categorySlug: 'cmt-subcontracting',
    title: 'پذیرش دوخت مزدی هودی زمستانه با پارچه دورس سه نخ',
    description: 'خط دوخت صنعتی ۱۵ نفره آماده همکاری با برندهای پوشاک با تضمین کنترل کیفیت و زمان‌بندی دقیق',
    activityType: 'capacity',
    commodityType: 'service',
    priceType: 'per_unit',
    priceAmount: 45000,
    unit: 'عدد',
    minimumOrder: '۵۰۰ تکه',
    city: 'تهران',
    province: 'تهران',
    status: 'draft',
    mediaUrls: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
    ],
    location: {
      title: 'کارگاه مرکزی جمهوری',
      city: 'تهران',
      province: 'تهران',
      addressDetails: 'خیابان جمهوری، پاساژ کاوه',
    },
  });

  console.log(`✓ Draft created successfully with ID: ${draft.id}, Status: ${draft.status}`);
  if (draft.status !== 'draft') throw new Error('Assertion failed: Initial status must be draft');

  // Step 3: Verify Media & Location Relations
  console.log('\n[TEST 3] Verifying Media and Location independent relational links...');
  const detailed = await listingRepository.findById(draft.id);
  if (!detailed || detailed.media.length !== 1 || !detailed.location) {
    throw new Error('Assertion failed: Media or location relational link missing');
  }
  console.log(`✓ Found linked media: ${detailed.media[0]}`);
  console.log(`✓ Found linked location: ${detailed.location.title} - ${detailed.location.city}`);

  // Step 4: Update Draft as Business A
  console.log('\n[TEST 4] Updating Draft as Business A...');
  const updatedDraft = await listingRepository.updateDraft(draft.id, businessA.id, {
    title: 'پذیرش فوری دوخت مزدی هودی و اسلش دورس ۳ نخ',
    priceAmount: 42000,
  });
  if (!updatedDraft || updatedDraft.title !== 'پذیرش فوری دوخت مزدی هودی و اسلش دورس ۳ نخ') {
    throw new Error('Assertion failed: Draft update failed');
  }
  console.log(`✓ Updated Title: "${updatedDraft.title}", New Price: ${updatedDraft.priceAmount}`);

  // Step 5: PROOF 2 — Cross-Business Mutation Prevention
  console.log('\n[PROOF 2] Testing Cross-Business Mutation Guard (Business B -> Business A)...');
  const crossBusinessUpdate = await listingRepository.updateDraft(draft.id, businessB.id, {
    title: 'Hacked title by unauthorized business B',
  });

  if (crossBusinessUpdate !== null) {
    throw new Error('CRITICAL FAILURE: Cross-business update was permitted! Data isolation breached.');
  }
  console.log('✓ PASS: Business B was strictly prevented from modifying Business A listing (Returned null/unauthorized).');

  // Step 6: Publish Listing
  console.log('\n[TEST 6] Executing Publish Command...');
  const published = await listingRepository.publishListing(draft.id, businessA.id);
  if (!published || published.status !== 'published') {
    throw new Error('Assertion failed: Listing could not be published');
  }
  console.log(`✓ Listing transitioned to status: ${published.status}, PublishedAt: ${published.publishedAt}`);

  // Step 7: PROOF 3 — Reject Invalid Lifecycle State Transition
  console.log('\n[PROOF 3] Testing Invalid Lifecycle Transition Guard...');
  try {
    // Attempt to edit a published listing via updateDraft (Guard must reject)
    await listingRepository.updateDraft(draft.id, businessA.id, {
      title: 'Trying to update already published listing via updateDraft',
    });
    throw new Error('CRITICAL FAILURE: updateDraft allowed on published listing without transition guard!');
  } catch (err: any) {
    if (err.message?.includes('INVALID_LIFECYCLE_STATE')) {
      console.log(`✓ PASS: Invalid transition rejected by Domain Guard: "${err.message}"`);
    } else {
      throw err;
    }
  }

  // Step 8: PROOF 1 — Persistence in PostgreSQL
  console.log('\n[PROOF 1] Testing Database Persistence & Public Feed Query...');
  const feed = await listingRepository.findFeed({ city: 'تهران' });
  const inFeed = feed.find(f => f.id === draft.id);
  if (!inFeed) {
    throw new Error('Assertion failed: Published listing not found in PostgreSQL feed');
  }
  console.log(`✓ Found published listing in database feed: "${inFeed.title}"`);
  console.log(`✓ Business Name correctly retrieved via relation: "${inFeed.author.name}"`);

  console.log('\n=====================================================');
  console.log('🎉 ALL 3 CORE PROOFS AND VERTICAL SLICE TESTS PASSED!');
  console.log('=====================================================');
  process.exit(0);
}

runVerticalSliceTests().catch((err) => {
  console.error('\n❌ Vertical slice test failed with error:', err);
  process.exit(1);
});
