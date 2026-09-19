/**
 * TAROPOD VERTICAL SLICE 02 AUTOMATED VERIFICATION SUITE
 *
 * Validates the complete practical end-to-end flow:
 * User / Identity -> Authentication Context -> Business -> Membership
 * -> Business Profile -> Listing Draft -> Edit -> Relational Media/Location
 * -> Publish -> Live Display
 */

import { ensureSeedContext } from '../middleware/auth.ts';
import { businessService } from '../modules/businesses/businesses.service.ts';
import { listingService } from '../modules/listings/listings.service.ts';
import { db } from '../../src/db/index.ts';
import { users } from '../../src/db/schema.ts';
import { eq } from 'drizzle-orm';
import { RequestAuthContext } from '../types/auth.ts';

async function runVerticalSlice02Tests() {
  console.log('=====================================================');
  console.log('🏁 STARTING TAROPOD VERTICAL SLICE 02 VERIFICATION');
  console.log('=====================================================');

  // Step 1: Ensure Deterministic Seed Context
  console.log('\n[STAGE 1: IDENTITY & AUTH CONTEXT]');
  const seed = await ensureSeedContext();
  const primaryUser = seed.primaryUser;
  console.log(`✓ Resolved authenticated user: "${primaryUser.name}" (ID: ${primaryUser.id})`);

  // Step 2: Atomic Business Creation with Owner Membership
  console.log('\n[STAGE 2: BUSINESS CREATION WITH ATOMIC OWNER MEMBERSHIP]');
  const uniqueSlug = `test-workshop-${Date.now()}`;
  const creationResult = await businessService.createBusiness(primaryUser, {
    name: 'کارگاه نمونه دوز نوین تاروپود',
    slug: uniqueSlug,
    city: 'اصفهان',
    province: 'اصفهان',
    phone: '03133334444',
    address: 'شهرک صنعتی جی، خیابان چهارم',
    description: 'کارگاه تخصصی نمونه‌دوزی و الگوبرداری البسه صنعتی',
    managerName: 'مهندس احمدی',
    workshopAreaSqm: 350,
    activeMachinesCount: 14,
    personnelCount: 18,
    whatsapp: '09131112233',
    verifiedBadges: ['iso9001', 'sample_maker'],
  });

  const createdBiz = creationResult.business;
  const initialMembership = creationResult.membership;

  if (!createdBiz.id || createdBiz.slug !== uniqueSlug) {
    throw new Error('Assertion failed: Business entity creation failed or slug mismatch.');
  }
  if (initialMembership.role !== 'owner' || initialMembership.userId !== primaryUser.id) {
    throw new Error('Assertion failed: Atomic owner membership was not created properly.');
  }
  console.log(`✓ Business created in PostgreSQL: "${createdBiz.name}" (ID: ${createdBiz.id})`);
  console.log(`✓ Atomic owner membership confirmed: Role: ${initialMembership.role}, User: ${initialMembership.userId}`);

  // Step 3: Enforce Duplicate Slug Guard
  console.log('\n[STAGE 3: SLUG UNIQUENESS ENFORCEMENT]');
  let duplicateRejected = false;
  try {
    await businessService.createBusiness(primaryUser, {
      name: 'کارگاه تکراری',
      slug: uniqueSlug, // Reusing same slug
      city: 'تهران',
    });
  } catch (error: any) {
    if (error.message.includes('DUPLICATE_SLUG')) {
      duplicateRejected = true;
    }
  }
  if (!duplicateRejected) {
    throw new Error('CRITICAL FAILURE: Duplicate business slug was allowed!');
  }
  console.log('✓ Duplicate slug correctly rejected with DUPLICATE_SLUG constraint error.');

  // Create an Auth Context for the newly created business
  const ownerAuthContext: RequestAuthContext = {
    user: primaryUser,
    activeBusinessId: createdBiz.id,
    activeRole: 'owner',
    memberships: [
      {
        id: initialMembership.id,
        businessId: createdBiz.id,
        role: 'owner',
        isDefault: true,
        businessName: createdBiz.name,
        businessSlug: createdBiz.slug,
      },
    ],
  };

  // Step 4: Membership Operations (Add and List members)
  console.log('\n[STAGE 4: MEMBERSHIP MANAGEMENT]');
  // Create a secondary dummy user in db if needed
  let [secondaryUser] = await db.select().from(users).where(eq(users.mobile, '09998887766')).limit(1);
  if (!secondaryUser) {
    [secondaryUser] = await db.insert(users).values({
      uid: 'user-secondary-worker',
      name: 'رضا کارگرپور',
      mobile: '09998887766',
      email: 'reza@example.com',
    }).returning();
  }

  const newMember = await businessService.addMember(ownerAuthContext, createdBiz.id, secondaryUser.id, 'manager');
  if (newMember.role !== 'manager' || newMember.userId !== secondaryUser.id) {
    throw new Error('Assertion failed: Failed to add manager to business.');
  }
  console.log(`✓ Added user "${secondaryUser.name}" to business as manager.`);

  const membersList = await businessService.listMembers(ownerAuthContext, createdBiz.id);
  if (membersList.length < 2) {
    throw new Error('Assertion failed: Expected at least 2 members in business.');
  }
  console.log(`✓ Retrieved ${membersList.length} members from PostgreSQL database.`);

  // Step 5: Business Profile Upsert and Retrieval
  console.log('\n[STAGE 5: BUSINESS PROFILE UPDATE & PERSISTENCE]');
  const updatedProfile = await businessService.updateProfile(ownerAuthContext, createdBiz.id, {
    description: 'برترین مرکز خدمات الگو و سایزبندی در قطب نساجی اصفهان با دستگاه‌های تمام اتوماتیک',
    workshopAreaSqm: 400,
    activeMachinesCount: 16,
    website: 'https://sample-textile.example.ir',
  });

  if (updatedProfile.profile.workshopAreaSqm !== 400 || updatedProfile.profile.activeMachinesCount !== 16) {
    throw new Error('Assertion failed: Profile update values did not persist.');
  }
  console.log(`✓ Business profile updated in PostgreSQL: Area: ${updatedProfile.profile.workshopAreaSqm} sqm, Machines: ${updatedProfile.profile.activeMachinesCount}`);

  // Step 6: Listing Draft Creation
  console.log('\n[STAGE 6: LISTING DRAFT CREATION]');
  const draftListing = await listingService.createDraft({
    businessId: createdBiz.id,
    createdById: primaryUser.id,
    categorySlug: 'pattern-making',
    title: 'ارائه خدمات الگوسازی و گرادینگ تخصصی انواع پوشاک تریکو',
    description: 'الگوسازی حرفه‌ای با جدیدترین نرم‌افزارهای دیجیتال، بهینه‌سازی مصرف پارچه (چیدمان) و تحویل پلات مستقیم',
    activityType: 'capacity',
    commodityType: 'service',
    priceType: 'fixed',
    priceAmount: 850000,
    unit: 'مدل',
    minimumOrder: '۱ مدل',
    city: 'اصفهان',
    province: 'اصفهان',
    status: 'draft',
    mediaUrls: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
    ],
    location: {
      title: 'دفتر فنی شهرک صنعتی جی',
      city: 'اصفهان',
      province: 'اصفهان',
      addressDetails: 'شهرک صنعتی جی، خیابان ۴، واحد ۸',
    },
  });

  if (draftListing.status !== 'draft' || draftListing.businessId !== createdBiz.id) {
    throw new Error('Assertion failed: Draft listing creation failed.');
  }
  console.log(`✓ Draft listing created: "${draftListing.title}" (ID: ${draftListing.id})`);

  // Step 7: Draft Editing
  console.log('\n[STAGE 7: DRAFT EDITING & LIFECYCLE GUARD]');
  const editedDraft = await listingService.updateDraft(draftListing.id, createdBiz.id, {
    title: 'ارائه خدمات الگوسازی دیجیتال و گرادینگ تخصصی انواع پوشاک تریکو و شومیز',
    priceAmount: 900000,
    minimumOrder: '۲ مدل',
  });

  if (!editedDraft || Number(editedDraft.priceAmount) !== 900000) {
    throw new Error(`Assertion failed: Draft editing did not update fields. Received price: ${editedDraft?.priceAmount}`);
  }
  console.log(`✓ Draft updated: New price: ${editedDraft.priceAmount}, Title: "${editedDraft.title}"`);

  // Step 8: Relational Media Attach and Detach
  console.log('\n[STAGE 8: RELATIONAL MEDIA ATTACH / DETACH]');
  const attachedMedia = await listingService.attachMedia(
    draftListing.id,
    createdBiz.id,
    'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800',
    primaryUser.id,
    false
  );
  if (!attachedMedia) {
    throw new Error('Assertion failed: Attaching media failed.');
  }
  console.log('✓ Media attachment created and linked.');

  const beforeDetach = await listingService.getById(draftListing.id);
  if (!beforeDetach || beforeDetach.media.length !== 2) {
    throw new Error(`Assertion failed: Expected 2 media items, got ${beforeDetach?.media.length}`);
  }
  console.log(`✓ Verified listing now has ${beforeDetach.media.length} media items.`);

  const detached = await listingService.detachMedia(
    draftListing.id,
    createdBiz.id,
    'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800'
  );
  if (!detached) {
    throw new Error('Assertion failed: Detaching media failed.');
  }
  const afterDetach = await listingService.getById(draftListing.id);
  if (!afterDetach || afterDetach.media.length !== 1) {
    throw new Error(`Assertion failed: Expected 1 media item after detachment, got ${afterDetach?.media.length}`);
  }
  console.log(`✓ Media successfully detached; listing has ${afterDetach.media.length} remaining media item.`);

  // Step 9: Relational Location Attach / Detach
  console.log('\n[STAGE 9: RELATIONAL LOCATION ATTACH / DETACH]');
  await listingService.attachLocation(draftListing.id, createdBiz.id, {
    title: 'کارگاه نمونه‌دوزی شماره ۲',
    city: 'اصفهان',
    province: 'اصفهان',
    latitude: 32.6546,
    longitude: 51.6680,
    addressDetails: 'میدان آزادی، ابتدای خیابان دانشگاه',
  });

  const withNewLocation = await listingService.getById(draftListing.id);
  if (!withNewLocation?.location || withNewLocation.location.title !== 'کارگاه نمونه‌دوزی شماره ۲') {
    throw new Error('Assertion failed: Attaching location failed.');
  }
  console.log(`✓ Location attached: "${withNewLocation.location.title}" (${withNewLocation.location.city})`);

  // Step 10: Publish Command & Transition Guard
  console.log('\n[STAGE 10: PUBLISH COMMAND & LIFECYCLE]');
  const publishedListing = await listingService.publish(draftListing.id, createdBiz.id);
  if (!publishedListing || publishedListing.status !== 'published') {
    throw new Error('Assertion failed: Failed to transition status to published.');
  }
  console.log(`✓ Listing transitioned to status "published" (publishedAt: ${publishedListing.publishedAt})`);

  // Guard: Editing published listing via updateDraft should fail
  let publishedEditRejected = false;
  try {
    await listingService.updateDraft(draftListing.id, createdBiz.id, {
      title: 'Should fail editing published listing',
    });
  } catch (error: any) {
    if (error.message.includes('INVALID_LIFECYCLE_STATE')) {
      publishedEditRejected = true;
    }
  }
  if (!publishedEditRejected) {
    throw new Error('CRITICAL FAILURE: Editing published listing via updateDraft was not blocked!');
  }
  console.log('✓ Editing published listing via updateDraft strictly rejected by lifecycle guard.');

  // Step 11: Live Display & Feed Verification
  console.log('\n[STAGE 11: LIVE DISPLAY & PUBLIC FEED QUERY]');
  const liveListing = await listingService.getById(draftListing.id);
  if (!liveListing) {
    throw new Error('Assertion failed: Could not retrieve published listing by ID.');
  }
  if (liveListing.business.name !== createdBiz.name || liveListing.listing.status !== 'published') {
    throw new Error('Assertion failed: Retrieved live listing has incorrect business or status.');
  }
  console.log(`✓ Live listing detail retrieved: "${liveListing.listing.title}" from "${liveListing.business.name}"`);

  const publicFeed = await listingService.getFeed({ categorySlug: 'pattern-making' });
  const inFeed = publicFeed.find(item => item.id === draftListing.id || item.listing?.id === draftListing.id);
  if (!inFeed) {
    throw new Error('Assertion failed: Published listing does not appear in public feed.');
  }
  console.log(`✓ Successfully verified published listing presence in public feed query.`);

  console.log('\n=====================================================');
  console.log('🎉 ALL VERTICAL SLICE 02 SPECIFICATIONS & PROOFS PASSED!');
  console.log('=====================================================');
}

runVerticalSlice02Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ VERTICAL SLICE 02 FAILURE:', err);
    process.exit(1);
  });
