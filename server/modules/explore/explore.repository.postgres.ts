import { db } from '../../../src/db/index.ts';
import {
  listings,
  businesses,
  businessProfiles,
  categories,
  listingMedia,
  media,
  listingLocations,
  locations,
} from '../../../src/db/schema.ts';
import { eq, and, or, ilike, desc, sql, inArray } from 'drizzle-orm';
import {
  ExploreFilterParams,
  ExploreListingItem,
  ExploreSearchResult,
  ExploreRepositoryPort,
} from './explore.repository.port.ts';

export class PostgresExploreRepository implements ExploreRepositoryPort {
  async search(filters: ExploreFilterParams): Promise<ExploreSearchResult> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions = [eq(listings.status, 'published')];

    // Category filter: could be categoryId (UUID) or categorySlug
    if (filters.categoryId) {
      // Check if it's a UUID or slug
      const isUuid = /^[0-9a-fA-F-]{36}$/.test(filters.categoryId);
      if (isUuid) {
        // Find all child category IDs if this is a parent category
        const children = await db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.parentId, filters.categoryId));
        
        const categoryIds = [filters.categoryId, ...children.map((c) => c.id)];
        conditions.push(inArray(listings.categoryId, categoryIds));
      } else {
        // Assume it's a slug
        const [cat] = await db
          .select()
          .from(categories)
          .where(eq(categories.slug, filters.categoryId))
          .limit(1);

        if (cat) {
          const children = await db
            .select({ id: categories.id, slug: categories.slug })
            .from(categories)
            .where(eq(categories.parentId, cat.id));

          const slugs = [cat.slug, ...children.map((c) => c.slug)];
          conditions.push(inArray(listings.categorySlug, slugs));
        } else {
          conditions.push(eq(listings.categorySlug, filters.categoryId));
        }
      }
    } else if (filters.categorySlug) {
      const [cat] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, filters.categorySlug))
        .limit(1);

      if (cat) {
        const children = await db
          .select({ id: categories.id, slug: categories.slug })
          .from(categories)
          .where(eq(categories.parentId, cat.id));

        const slugs = [cat.slug, ...children.map((c) => c.slug)];
        conditions.push(inArray(listings.categorySlug, slugs));
      } else {
        conditions.push(eq(listings.categorySlug, filters.categorySlug));
      }
    }

    // Province filter
    if (filters.province && filters.province !== 'همه استان‌ها') {
      conditions.push(
        or(
          ilike(listings.province, `%${filters.province}%`),
          ilike(businesses.province, `%${filters.province}%`)
        )!
      );
    }

    // City filter
    if (filters.city && filters.city !== 'همه شهرها') {
      conditions.push(
        or(
          ilike(listings.city, `%${filters.city}%`),
          ilike(businesses.city, `%${filters.city}%`)
        )!
      );
    }

    // Business type / Activity type filter
    if (filters.businessType && filters.businessType !== 'all') {
      conditions.push(
        or(
          eq(listings.activityType, filters.businessType),
          eq(listings.commodityType, filters.businessType)
        )!
      );
    }

    // Text Search filter (pure PostgreSQL ILIKE)
    if (filters.search && filters.search.trim().length > 0) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(listings.title, term),
          ilike(listings.description, term),
          ilike(businesses.name, term)
        )!
      );
    }

    const whereClause = and(...conditions);

    // Count query
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(listings)
      .innerJoin(businesses, eq(listings.businessId, businesses.id))
      .where(whereClause);

    const total = Number(countResult?.count || 0);

    // Rows query
    const rows = await db
      .select({
        listing: listings,
        business: businesses,
        profile: businessProfiles,
        category: categories,
      })
      .from(listings)
      .innerJoin(businesses, eq(listings.businessId, businesses.id))
      .leftJoin(businessProfiles, eq(businesses.id, businessProfiles.businessId))
      .leftJoin(categories, eq(listings.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(listings.publishedAt), desc(listings.createdAt))
      .limit(limit)
      .offset(offset);

    // Collect listing IDs for batch media and location resolution
    const listingIds = rows.map((r) => r.listing.id);

    const mediaMap = new Map<string, Array<{ id: string; url: string; isCover: boolean; displayOrder: number }>>();
    const locationMap = new Map<string, any>();

    if (listingIds.length > 0) {
      // Fetch media
      const mediaRows = await db
        .select({
          listingId: listingMedia.listingId,
          mediaId: media.id,
          url: media.url,
          isCover: listingMedia.isCover,
          displayOrder: listingMedia.displayOrder,
        })
        .from(listingMedia)
        .innerJoin(media, eq(listingMedia.mediaId, media.id))
        .where(inArray(listingMedia.listingId, listingIds));

      for (const m of mediaRows) {
        if (!mediaMap.has(m.listingId)) {
          mediaMap.set(m.listingId, []);
        }
        mediaMap.get(m.listingId)!.push({
          id: m.mediaId,
          url: m.url,
          isCover: m.isCover,
          displayOrder: m.displayOrder,
        });
      }

      // Fetch locations
      const locRows = await db
        .select({
          listingId: listingLocations.listingId,
          location: locations,
        })
        .from(listingLocations)
        .innerJoin(locations, eq(listingLocations.locationId, locations.id))
        .where(inArray(listingLocations.listingId, listingIds));

      for (const l of locRows) {
        if (!locationMap.has(l.listingId)) {
          locationMap.set(l.listingId, {
            id: l.location.id,
            title: l.location.title,
            province: l.location.province,
            city: l.location.city,
            latitude: l.location.latitude ? Number(l.location.latitude) : null,
            longitude: l.location.longitude ? Number(l.location.longitude) : null,
            addressDetails: l.location.addressDetails,
          });
        }
      }
    }

    const items: ExploreListingItem[] = rows.map((r) => ({
      listing: {
        id: r.listing.id,
        title: r.listing.title,
        description: r.listing.description,
        activityType: r.listing.activityType,
        commodityType: r.listing.commodityType,
        priceType: r.listing.priceType,
        priceAmount: r.listing.priceAmount ? Number(r.listing.priceAmount) : null,
        unit: r.listing.unit,
        minimumOrder: r.listing.minimumOrder,
        city: r.listing.city,
        province: r.listing.province,
        status: r.listing.status,
        viewsCount: r.listing.viewsCount,
        publishedAt: r.listing.publishedAt,
        createdAt: r.listing.createdAt,
      },
      business: {
        id: r.business.id,
        name: r.business.name,
        slug: r.business.slug,
        phone: r.business.phone,
        city: r.business.city,
        province: r.business.province,
        address: r.business.address,
        isVerified: r.business.isVerified,
        rating: r.profile?.rating ? Number(r.profile.rating) : 5.0,
        reviewsCount: r.profile?.reviewsCount || 0,
        avatarUrl: r.profile?.avatarUrl || null,
        coverUrl: r.profile?.coverUrl || null,
        workshopAreaSqm: r.profile?.workshopAreaSqm || null,
        activeMachinesCount: r.profile?.activeMachinesCount || null,
        personnelCount: r.profile?.personnelCount || null,
      },
      category: r.category
        ? {
            id: r.category.id,
            slug: r.category.slug,
            titleFa: r.category.titleFa,
            titleEn: r.category.titleEn,
            icon: r.category.icon,
          }
        : null,
      location: locationMap.get(r.listing.id) || null,
      media: mediaMap.get(r.listing.id) || [],
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export const exploreRepository = new PostgresExploreRepository();
