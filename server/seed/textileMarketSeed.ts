import { db } from '../../src/db/index.ts';
import {
  users,
  businesses,
  businessProfiles,
  businessMemberships,
  listings,
  media,
  listingMedia,
  locations,
  listingLocations,
  categories,
} from '../../src/db/schema.ts';
import { eq, sql } from 'drizzle-orm';
import { MOCK_PROFILES_20 } from '../../src/data/mockProfilesData.ts';
import { MOCK_ADS_22 } from '../../src/data/mockAdsData.ts';

export async function seedTextileMarketData() {
  try {
    // 1. Check if we already have 20+ businesses and 20+ DISTINCT listing titles
    const distinctTitles = await db.selectDistinct({ title: listings.title }).from(listings);
    if (distinctTitles.length >= 20) {
      return;
    }

    console.log('[SEED] Seeding 20 textile business profiles and 22 rich ads into PostgreSQL...');

    // Clean up old duplicate test listings
    try {
      await db.execute(sql`
        DELETE FROM listing_media;
        DELETE FROM listing_locations;
        DELETE FROM listings;
      `);
    } catch {
      // Ignore if table cleanup has errors
    }

    // Get or create system seed user
    let [systemUser] = await db.select().from(users).where(eq(users.uid, 'taropod-system-user-01')).limit(1);
    if (!systemUser) {
      [systemUser] = await db.insert(users).values({
        uid: 'taropod-system-user-01',
        name: 'مدیر سامانه تاروپود',
        mobile: '09121112233',
        email: 'info@taropod.ir',
      }).returning();
    }

    // Map to hold created/existing business IDs by mock authorId (e.g. 'user-1' -> uuid)
    const authorBizMap = new Map<string, string>();

    // 2. Insert or get all 20 businesses from MOCK_PROFILES_20
    for (const [authorId, prof] of Object.entries(MOCK_PROFILES_20)) {
      const slug = `biz-${authorId.toLowerCase()}`;
      let [existingBiz] = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);

      if (!existingBiz) {
        const phone = prof.contacts?.phone || prof.contacts?.mobile || '02166778899';
        const city = prof.location?.city || 'تهران';
        const address = prof.location?.address || 'تهران، بازار بزرگ';
        const description = prof.fullDescription || prof.bio || prof.specialty || 'تولیدکننده معتبر نساجی';
        const avatarUrl = prof.logo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
        const coverUrl = prof.banner || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80';

        [existingBiz] = await db.insert(businesses).values({
          name: prof.name,
          slug,
          phone,
          province: 'تهران',
          city,
          address,
          isVerified: prof.isVerified ?? true,
          createdById: systemUser.id,
        }).returning();

        // Business Profile record
        await db.insert(businessProfiles).values({
          businessId: existingBiz.id,
          description,
          managerName: prof.name.split(' ')[0] || 'مدیر واحد',
          workshopAreaSqm: 400,
          activeMachinesCount: 15,
          personnelCount: 12,
          whatsapp: prof.contacts?.whatsapp || prof.contacts?.mobile || '09121112233',
          avatarUrl,
          coverUrl,
          rating: prof.rating ? String(prof.rating) : '4.85',
          reviewsCount: prof.reviewsCount || 15,
        });

        // Membership
        await db.insert(businessMemberships).values({
          userId: systemUser.id,
          businessId: existingBiz.id,
          role: 'owner',
          isDefault: authorId === 'user-1',
        });
      }

      authorBizMap.set(authorId, existingBiz.id);
    }

    // 3. Insert 22 Diverse Listings with realistic images, videos, and locations
    for (let i = 0; i < MOCK_ADS_22.length; i++) {
      const ad = MOCK_ADS_22[i];
      const bizId = authorBizMap.get(ad.authorId) || authorBizMap.get('user-1')!;

      // Map ad category to slug
      const categorySlugMap: Record<string, string> = {
        'خدمات تولیدی': 'cmt-subcontracting',
        'پارچه و منسوجات': 'raw-fabrics',
        'ماشین‌آلات صنعتی': 'sewing-machines',
        'خرج کار و ملزومات': 'haberdashery',
        'طراحی و الگو': 'pattern-making',
        'مواد اولیه': 'yarn-spinning',
        'چاپ و گلدوزی': 'printing-embroidery',
        'خدمات فنی و مهندسی': 'maintenance-repair',
        'بسته‌بندی و لیبل': 'packaging',
        'لوازم و تجهیزات': 'ironing-finishing',
        'نخ و الیاف': 'yarn-spinning',
      };
      const catSlug = categorySlugMap[ad.category] || 'cmt-subcontracting';

      // Check if listing with this title already exists
      const [existingListing] = await db
        .select()
        .from(listings)
        .where(eq(listings.title, ad.title))
        .limit(1);

      if (existingListing) {
        continue;
      }

      // Clean numeric price
      const numericPrice = ad.price
        ? Number(ad.price.replace(/[^\d]/g, '')) || null
        : null;

      const [createdListing] = await db.insert(listings).values({
        businessId: bizId,
        createdById: systemUser.id,
        categorySlug: catSlug,
        title: ad.title,
        description: ad.description,
        activityType: ad.hasVideo ? 'video-showcase' : 'offer',
        commodityType: ad.subCategory || 'product',
        priceType: ad.price?.includes('تومان') ? 'fixed' : 'negotiable',
        priceAmount: numericPrice ? String(numericPrice) : null,
        unit: 'عدد',
        minimumOrder: 'تک و عمده',
        city: ad.city || 'تهران',
        province: ad.province || 'تهران',
        status: 'published',
        publishedAt: new Date(Date.now() - (i + 1) * 3600000),
      }).returning();

      // Insert Media
      const mediaUrls = ad.images && ad.images.length > 0
        ? ad.images
        : ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80'];

      for (let mIdx = 0; mIdx < mediaUrls.length; mIdx++) {
        const [m] = await db.insert(media).values({
          businessId: bizId,
          uploadedById: systemUser.id,
          url: mediaUrls[mIdx],
          mimeType: 'image/jpeg',
        }).returning();

        await db.insert(listingMedia).values({
          listingId: createdListing.id,
          mediaId: m.id,
          displayOrder: mIdx,
          isCover: mIdx === 0,
        });
      }

      // If ad has a video, insert video media
      if (ad.hasVideo && ad.videoUrl) {
        const [vMedia] = await db.insert(media).values({
          businessId: bizId,
          uploadedById: systemUser.id,
          url: ad.videoUrl,
          mimeType: 'video/mp4',
        }).returning();

        await db.insert(listingMedia).values({
          listingId: createdListing.id,
          mediaId: vMedia.id,
          displayOrder: mediaUrls.length,
          isCover: false,
        });
      }

      // Insert Location
      if (ad.location) {
        const [loc] = await db.insert(locations).values({
          title: ad.location.areaName || ad.city,
          province: ad.province || 'تهران',
          city: ad.city || 'تهران',
          latitude: ad.location.lat ? String(ad.location.lat) : null,
          longitude: ad.location.lng ? String(ad.location.lng) : null,
          addressDetails: ad.location.addressText,
        }).returning();

        await db.insert(listingLocations).values({
          listingId: createdListing.id,
          locationId: loc.id,
          isPrimary: true,
        });
      }
    }

    console.log('[SEED] Successfully seeded 20 businesses and 22 diverse textile ads!');
  } catch (err) {
    console.error('[SEED] Error seeding textile market data:', err);
  }
}
