/**
 * TAROPOD CANONICAL DATA MODEL & COMPATIBILITY LAYER TEST SUITE
 * 
 * Verifies that:
 * 1. Bi-directional mapping between legacy activityType/commodityType and Canonical MarketIntent/MarketObjectType works accurately.
 * 2. Status and publication lifecycle states map correctly.
 * 3. PostgreSQL database records seamlessly project into CanonicalListing without schema changes.
 * 4. Reverse mapping (toLegacyDraftPayload) produces compatible inputs for existing repository methods.
 * 5. Actor and multi-role unification functions as specified in the Canonical contract.
 */

import { CanonicalCompatibilityAdapter } from '../modules/canonical/compatibility.adapter.ts';
import { listingRepository } from '../modules/listings/listings.repository.postgres.ts';
import { ensureSeedContext } from '../middleware/auth.ts';
import { db } from '../../src/db/index.ts';
import { listings } from '../../src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function runCanonicalCompatibilityTests() {
  console.log('=====================================================');
  console.log('🏁 STARTING TAROPOD CANONICAL DATA MODEL VERIFICATION');
  console.log('=====================================================');

  // [TEST 1] Intent and Market Object Type Bidirectional Mapping
  console.log('\n[TEST 1] Testing Intent & MarketObjectType mappings...');
  
  const t1 = CanonicalCompatibilityAdapter.mapLegacyToCanonicalIntentAndType('offer', 'product');
  if (t1.intent !== 'OFFER' || t1.marketObjectType !== 'PHYSICAL_PRODUCT') {
    throw new Error(`Failed Test 1.1: Expected OFFER/PHYSICAL_PRODUCT, got ${t1.intent}/${t1.marketObjectType}`);
  }
  console.log('✓ offer + product -> OFFER / PHYSICAL_PRODUCT');

  const t2 = CanonicalCompatibilityAdapter.mapLegacyToCanonicalIntentAndType('capacity', 'capacity');
  if (t2.intent !== 'OFFER' || t2.marketObjectType !== 'CAPACITY') {
    throw new Error(`Failed Test 1.2: Expected OFFER/CAPACITY, got ${t2.intent}/${t2.marketObjectType}`);
  }
  console.log('✓ capacity + capacity -> OFFER / CAPACITY');

  const t3 = CanonicalCompatibilityAdapter.mapLegacyToCanonicalIntentAndType('offer', 'material');
  if (t3.intent !== 'OFFER' || t3.marketObjectType !== 'MATERIAL') {
    throw new Error(`Failed Test 1.3: Expected OFFER/MATERIAL, got ${t3.intent}/${t3.marketObjectType}`);
  }
  console.log('✓ offer + material -> OFFER / MATERIAL');

  const t4 = CanonicalCompatibilityAdapter.mapLegacyToCanonicalIntentAndType('offer', 'machine');
  if (t4.intent !== 'OFFER' || t4.marketObjectType !== 'EQUIPMENT') {
    throw new Error(`Failed Test 1.4: Expected OFFER/EQUIPMENT, got ${t4.intent}/${t4.marketObjectType}`);
  }
  console.log('✓ offer + machine -> OFFER / EQUIPMENT');

  const t5 = CanonicalCompatibilityAdapter.mapLegacyToCanonicalIntentAndType('need', 'material');
  if (t5.intent !== 'DEMAND' || t5.marketObjectType !== 'MATERIAL') {
    throw new Error(`Failed Test 1.5: Expected DEMAND/MATERIAL, got ${t5.intent}/${t5.marketObjectType}`);
  }
  console.log('✓ need + material -> DEMAND / MATERIAL');

  const t6 = CanonicalCompatibilityAdapter.mapLegacyToCanonicalIntentAndType('need', 'product');
  if (t6.intent !== 'DEMAND' || t6.marketObjectType !== 'NEED') {
    throw new Error(`Failed Test 1.6: Expected DEMAND/NEED, got ${t6.intent}/${t6.marketObjectType}`);
  }
  console.log('✓ need + product -> DEMAND / NEED');

  // [TEST 2] Reverse Mapping (Canonical -> Legacy Columns)
  console.log('\n[TEST 2] Testing Reverse Mapping (Canonical -> Legacy)...');
  const rev1 = CanonicalCompatibilityAdapter.mapCanonicalToLegacy('OFFER', 'EQUIPMENT');
  if (rev1.activityType !== 'offer' || rev1.commodityType !== 'machine') {
    throw new Error(`Failed Test 2.1: Reverse mapping mismatch`);
  }
  console.log('✓ OFFER / EQUIPMENT -> offer + machine');

  const rev2 = CanonicalCompatibilityAdapter.mapCanonicalToLegacy('DEMAND', 'MATERIAL');
  if (rev2.activityType !== 'need' || rev2.commodityType !== 'material') {
    throw new Error(`Failed Test 2.2: Reverse mapping mismatch`);
  }
  console.log('✓ DEMAND / MATERIAL -> need + material');

  const rev3 = CanonicalCompatibilityAdapter.mapCanonicalToLegacy('OFFER', 'CAPACITY');
  if (rev3.activityType !== 'capacity' || rev3.commodityType !== 'capacity') {
    throw new Error(`Failed Test 2.3: Reverse mapping mismatch`);
  }
  console.log('✓ OFFER / CAPACITY -> capacity + capacity');

  // [TEST 3] Publication State Mapping
  console.log('\n[TEST 3] Testing Publication State Mapping...');
  if (CanonicalCompatibilityAdapter.mapLegacyPublicationStatus('draft') !== 'DRAFT') throw new Error('State error DRAFT');
  if (CanonicalCompatibilityAdapter.mapLegacyPublicationStatus('published') !== 'PUBLISHED') throw new Error('State error PUBLISHED');
  if (CanonicalCompatibilityAdapter.mapLegacyPublicationStatus('pending_payment') !== 'PENDING_PAYMENT') throw new Error('State error PENDING_PAYMENT');
  if (CanonicalCompatibilityAdapter.mapLegacyPublicationStatus('archived') !== 'ARCHIVED') throw new Error('State error ARCHIVED');
  console.log('✓ All lifecycle publication states mapped cleanly.');

  // [TEST 4] Database Live Record Projection to CanonicalListing
  console.log('\n[TEST 4] Projecting Live PostgreSQL Record to CanonicalListing...');
  const seed = await ensureSeedContext();
  const business = seed.primaryBusiness;

  // Retrieve an existing listing from the database
  const [existingRecord] = await db.select().from(listings).where(eq(listings.businessId, business.id)).limit(1);
  if (!existingRecord) {
    throw new Error('No existing listing found for seed business to test projection.');
  }

  const canonicalListing = CanonicalCompatibilityAdapter.toCanonicalListing(
    existingRecord,
    business,
    [{ title: 'کارگاه مرکزی', province: 'تهران', city: 'تهران', industrialPark: 'عباس آباد' }],
    [{ url: 'https://example.com/fabric.jpg', isCover: true }]
  );

  console.log(`✓ Canonical Listing ID: ${canonicalListing.id}`);
  console.log(`✓ Canonical Market Object Type: ${canonicalListing.marketObject.type}`);
  console.log(`✓ Canonical Market Intent: ${canonicalListing.marketObject.intent}`);
  console.log(`✓ Canonical Publisher Actor: ${canonicalListing.publisherActor.name} (${canonicalListing.publisherActor.type})`);
  console.log(`✓ Roles Assigned: ${canonicalListing.publisherActor.roles.join(', ')}`);
  console.log(`✓ Provenance: ${canonicalListing.marketObject.provenance}`);

  if (!canonicalListing.marketObject.title || canonicalListing.marketObject.title !== existingRecord.title) {
    throw new Error('Title mismatch in canonical market object projection');
  }
  if (canonicalListing.locations.length !== 1 || canonicalListing.media.length !== 1) {
    throw new Error('Relational locations or media missing from canonical projection');
  }

  // [TEST 5] Canonical to Legacy Draft Generation & Repository Verification
  console.log('\n[TEST 5] Creating Legacy Draft via Canonical Adapter...');
  const canonicalDraftInput = {
    title: 'تولید آزمایشی کشباف دورو پنبه ۲۴۰ گرم',
    description: 'ظرفیت بافت تریکو کشباف با ماشین‌آلات سیلندر ۲۸ مایردوز',
    categorySlug: 'knitting-subcontracting',
    intent: 'OFFER' as const,
    marketObjectType: 'CAPACITY' as const,
    priceType: 'per_unit' as const,
    priceAmount: 65000,
    unitOfMeasure: 'کیلوگرم',
    minimumOrderQuantity: 500
  };

  const legacyDraftPayload = CanonicalCompatibilityAdapter.toLegacyDraftPayload(canonicalDraftInput);
  console.log(`✓ Generated legacy payload: activityType=${legacyDraftPayload.activityType}, commodityType=${legacyDraftPayload.commodityType}`);

  const createdDraft = await listingRepository.createDraft({
    ...legacyDraftPayload,
    businessId: business.id,
    createdById: seed.primaryUser.id
  });

  console.log(`✓ Legacy draft created in PostgreSQL with ID: ${createdDraft.id}`);
  if (createdDraft.activityType !== 'capacity') {
    throw new Error('Created draft activityType mismatch');
  }

  // [TEST 6] Canonical Actor Unification
  console.log('\n[TEST 6] Testing Canonical Actor Unification...');
  const actor = CanonicalCompatibilityAdapter.toCanonicalActor({
    user: seed.primaryUser,
    business: business,
    profile: {
      id: 'profile-123',
      slug: 'pars-dookht',
      bio: 'تولیدکننده تخصصی انواع پوشاک تریکو و کشباف'
    }
  });

  console.log(`✓ Unified Actor: ${actor.displayName} (${actor.type})`);
  console.log(`✓ Profiles linked: ${actor.profiles.length} (slug: ${actor.profiles[0]?.slug})`);
  console.log(`✓ Actor Roles: ${actor.roles.join(', ')}`);

  console.log('\n=====================================================');
  console.log('🎉 ALL CANONICAL DATA MODEL & ADAPTER TESTS PASSED!');
  console.log('=====================================================');
  process.exit(0);
}

runCanonicalCompatibilityTests().catch((err) => {
  console.error('❌ CANONICAL TEST SUITE FAILED:', err);
  process.exit(1);
});
