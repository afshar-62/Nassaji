import { db } from '../../../src/db/index.ts';
import { listings, businesses, businessProfiles, media, listingMedia, locations, listingLocations } from '../../../src/db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import { IListingRepository, CreateListingDTO, UpdateListingDraftDTO, ListingEntity } from './listings.repository.port.ts';

export class PostgresListingRepository implements IListingRepository {
  async createDraft(dto: CreateListingDTO): Promise<ListingEntity> {
    return await db.transaction(async (tx) => {
      const [inserted] = await tx.insert(listings).values({
        businessId: dto.businessId,
        createdById: dto.createdById,
        categorySlug: dto.categorySlug,
        title: dto.title,
        description: dto.description,
        activityType: dto.activityType || 'offer',
        commodityType: dto.commodityType || 'product',
        priceType: dto.priceType || 'negotiable',
        priceAmount: dto.priceAmount !== undefined ? String(dto.priceAmount) : null,
        unit: dto.unit || 'تکه',
        minimumOrder: dto.minimumOrder,
        city: dto.city,
        province: dto.province || 'تهران',
        status: dto.status || 'draft',
        publishedAt: dto.status === 'published' ? new Date() : null,
      }).returning();

      // Link media atomically if provided
      if (dto.mediaUrls && dto.mediaUrls.length > 0) {
        for (let i = 0; i < dto.mediaUrls.length; i++) {
          const url = dto.mediaUrls[i];
          const [m] = await tx.insert(media).values({
            businessId: dto.businessId,
            uploadedById: dto.createdById,
            url,
            mimeType: 'image/jpeg',
          }).returning();

          await tx.insert(listingMedia).values({
            listingId: inserted.id,
            mediaId: m.id,
            displayOrder: i,
            isCover: i === 0,
          });
        }
      }

      // Link location atomically if provided
      if (dto.location) {
        const [loc] = await tx.insert(locations).values({
          title: dto.location.title || dto.location.city,
          city: dto.location.city,
          province: dto.location.province,
          latitude: dto.location.latitude ? String(dto.location.latitude) : null,
          longitude: dto.location.longitude ? String(dto.location.longitude) : null,
          addressDetails: dto.location.addressDetails,
        }).returning();

        await tx.insert(listingLocations).values({
          listingId: inserted.id,
          locationId: loc.id,
          isPrimary: true,
        });
      }

      return inserted as any;
    });
  }

  async updateDraft(id: string, businessId: string, dto: UpdateListingDraftDTO): Promise<ListingEntity | null> {
    // Transition Guard: Only draft listings can be directly modified via updateDraft
    const [existing] = await db.select().from(listings)
      .where(and(eq(listings.id, id), eq(listings.businessId, businessId)))
      .limit(1);

    if (!existing) {
      return null;
    }

    if (existing.status !== 'draft') {
      throw new Error('INVALID_LIFECYCLE_STATE: Only draft listings can be edited via updateDraft.');
    }

    return await db.transaction(async (tx) => {
      const updatePayload: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (dto.title !== undefined) updatePayload.title = dto.title;
      if (dto.description !== undefined) updatePayload.description = dto.description;
      if (dto.activityType !== undefined) updatePayload.activityType = dto.activityType;
      if (dto.commodityType !== undefined) updatePayload.commodityType = dto.commodityType;
      if (dto.priceType !== undefined) updatePayload.priceType = dto.priceType;
      if (dto.priceAmount !== undefined) updatePayload.priceAmount = String(dto.priceAmount);
      if (dto.unit !== undefined) updatePayload.unit = dto.unit;
      if (dto.minimumOrder !== undefined) updatePayload.minimumOrder = dto.minimumOrder;
      if (dto.city !== undefined) updatePayload.city = dto.city;
      if (dto.province !== undefined) updatePayload.province = dto.province;

      const [updated] = await tx.update(listings)
        .set(updatePayload)
        .where(and(eq(listings.id, id), eq(listings.businessId, businessId)))
        .returning();

      // Synchronize media if provided in draft update
      if (dto.mediaUrls !== undefined) {
        await tx.delete(listingMedia).where(eq(listingMedia.listingId, id));
        for (let i = 0; i < dto.mediaUrls.length; i++) {
          const url = dto.mediaUrls[i];
          const [m] = await tx.insert(media).values({
            businessId,
            uploadedById: existing.createdById,
            url,
            mimeType: 'image/jpeg',
          }).returning();

          await tx.insert(listingMedia).values({
            listingId: id,
            mediaId: m.id,
            displayOrder: i,
            isCover: i === 0,
          });
        }
      }

      // Synchronize location if provided in draft update
      if (dto.location !== undefined) {
        await tx.delete(listingLocations).where(eq(listingLocations.listingId, id));
        const [loc] = await tx.insert(locations).values({
          title: dto.location.title || dto.location.city,
          city: dto.location.city,
          province: dto.location.province,
          latitude: dto.location.latitude ? String(dto.location.latitude) : null,
          longitude: dto.location.longitude ? String(dto.location.longitude) : null,
          addressDetails: dto.location.addressDetails,
        }).returning();

        await tx.insert(listingLocations).values({
          listingId: id,
          locationId: loc.id,
          isPrimary: true,
        });
      }

      return updated as any;
    });
  }

  async attachMedia(listingId: string, businessId: string, url: string, uploadedById: string, isCover: boolean = false): Promise<any> {
    const [existing] = await db.select().from(listings)
      .where(and(eq(listings.id, listingId), eq(listings.businessId, businessId)))
      .limit(1);

    if (!existing) {
      throw new Error('NOT_FOUND_OR_FORBIDDEN: آگهی یافت نشد یا به این کارگاه تعلق ندارد.');
    }

    return await db.transaction(async (tx) => {
      const [m] = await tx.insert(media).values({
        businessId,
        uploadedById,
        url,
        mimeType: 'image/jpeg',
      }).returning();

      const [link] = await tx.insert(listingMedia).values({
        listingId,
        mediaId: m.id,
        displayOrder: 0,
        isCover,
      }).returning();

      return { media: m, link };
    });
  }

  async detachMedia(listingId: string, businessId: string, mediaIdOrUrl: string): Promise<boolean> {
    const [existing] = await db.select().from(listings)
      .where(and(eq(listings.id, listingId), eq(listings.businessId, businessId)))
      .limit(1);

    if (!existing) {
      throw new Error('NOT_FOUND_OR_FORBIDDEN');
    }

    const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (UUID_PATTERN.test(mediaIdOrUrl)) {
      const res = await db.delete(listingMedia)
        .where(and(eq(listingMedia.listingId, listingId), eq(listingMedia.mediaId, mediaIdOrUrl)))
        .returning();

      if (res.length > 0) return true;
    }

    // Find media by URL and delete link
    const [m] = await db.select({ id: media.id }).from(media)
      .where(and(eq(media.businessId, businessId), eq(media.url, mediaIdOrUrl)))
      .limit(1);

    if (m) {
      await db.delete(listingMedia)
        .where(and(eq(listingMedia.listingId, listingId), eq(listingMedia.mediaId, m.id)));
      return true;
    }

    return false;
  }

  async attachLocation(
    listingId: string,
    businessId: string,
    locationData: { title?: string; city: string; province: string; latitude?: number; longitude?: number; addressDetails?: string }
  ): Promise<any> {
    const [existing] = await db.select().from(listings)
      .where(and(eq(listings.id, listingId), eq(listings.businessId, businessId)))
      .limit(1);

    if (!existing) {
      throw new Error('NOT_FOUND_OR_FORBIDDEN');
    }

    return await db.transaction(async (tx) => {
      // Remove any existing primary location
      await tx.delete(listingLocations).where(eq(listingLocations.listingId, listingId));

      const [loc] = await tx.insert(locations).values({
        title: locationData.title || locationData.city,
        city: locationData.city,
        province: locationData.province,
        latitude: locationData.latitude ? String(locationData.latitude) : null,
        longitude: locationData.longitude ? String(locationData.longitude) : null,
        addressDetails: locationData.addressDetails,
      }).returning();

      await tx.insert(listingLocations).values({
        listingId,
        locationId: loc.id,
        isPrimary: true,
      });

      return loc;
    });
  }

  async detachLocation(listingId: string, businessId: string): Promise<boolean> {
    const [existing] = await db.select().from(listings)
      .where(and(eq(listings.id, listingId), eq(listings.businessId, businessId)))
      .limit(1);

    if (!existing) {
      throw new Error('NOT_FOUND_OR_FORBIDDEN');
    }

    await db.delete(listingLocations).where(eq(listingLocations.listingId, listingId));
    return true;
  }

  async publishListing(id: string, businessId: string): Promise<ListingEntity | null> {
    const [existing] = await db.select().from(listings)
      .where(and(eq(listings.id, id), eq(listings.businessId, businessId)))
      .limit(1);

    if (!existing) {
      return null;
    }

    // Lifecycle transition check
    if (existing.status === 'archived') {
      throw new Error('INVALID_LIFECYCLE_STATE: Cannot directly publish an archived listing.');
    }

    const [updated] = await db.update(listings)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(listings.id, id), eq(listings.businessId, businessId)))
      .returning();

    return updated as any;
  }

  async archiveListing(id: string, businessId: string): Promise<ListingEntity | null> {
    const [existing] = await db.select().from(listings)
      .where(and(eq(listings.id, id), eq(listings.businessId, businessId)))
      .limit(1);

    if (!existing) return null;

    const [updated] = await db.update(listings)
      .set({
        status: 'archived',
        updatedAt: new Date(),
      })
      .where(and(eq(listings.id, id), eq(listings.businessId, businessId)))
      .returning();

    return updated as any;
  }

  async suspendListing(id: string, businessId: string): Promise<ListingEntity | null> {
    const [existing] = await db.select().from(listings)
      .where(and(eq(listings.id, id), eq(listings.businessId, businessId)))
      .limit(1);

    if (!existing) return null;

    const [updated] = await db.update(listings)
      .set({
        status: 'suspended',
        updatedAt: new Date(),
      })
      .where(and(eq(listings.id, id), eq(listings.businessId, businessId)))
      .returning();

    return updated as any;
  }

  async findById(id: string): Promise<{ listing: ListingEntity; media: string[]; location?: any; business: any } | null> {
    const [row] = await db
      .select({
        listing: listings,
        business: businesses,
        profile: businessProfiles,
      })
      .from(listings)
      .innerJoin(businesses, eq(listings.businessId, businesses.id))
      .leftJoin(businessProfiles, eq(businesses.id, businessProfiles.businessId))
      .where(eq(listings.id, id))
      .limit(1);

    if (!row) return null;

    // Fetch media URLs
    const mediaRows = await db
      .select({ url: media.url })
      .from(listingMedia)
      .innerJoin(media, eq(listingMedia.mediaId, media.id))
      .where(eq(listingMedia.listingId, id))
      .orderBy(listingMedia.displayOrder);

    // Fetch location
    const locationRows = await db
      .select({ loc: locations })
      .from(listingLocations)
      .innerJoin(locations, eq(listingLocations.locationId, locations.id))
      .where(eq(listingLocations.listingId, id))
      .limit(1);

    return {
      listing: row.listing as any,
      media: mediaRows.map(m => m.url),
      location: locationRows[0]?.loc,
      business: {
        id: row.business.id,
        name: row.business.name,
        slug: row.business.slug,
        phone: row.business.phone,
        city: row.business.city,
        address: row.business.address,
        isVerified: row.business.isVerified,
        rating: row.profile?.rating ? Number(row.profile.rating) : 5.0,
        reviewsCount: row.profile?.reviewsCount || 0,
        avatarUrl: row.profile?.avatarUrl,
        whatsapp: row.profile?.whatsapp,
      },
    };
  }

  async findFeed(filters: { categorySlug?: string; city?: string; limit?: number; offset?: number }): Promise<any[]> {
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    let query = db
      .select({
        listing: listings,
        business: businesses,
        profile: businessProfiles,
      })
      .from(listings)
      .innerJoin(businesses, eq(listings.businessId, businesses.id))
      .leftJoin(businessProfiles, eq(businesses.id, businessProfiles.businessId))
      .where(eq(listings.status, 'published'))
      .orderBy(desc(listings.createdAt))
      .limit(limit)
      .offset(offset);

    const rows = await query;

    // Enrich with media
    const results = [];
    for (const r of rows) {
      const mediaRows = await db
        .select({ url: media.url })
        .from(listingMedia)
        .innerJoin(media, eq(listingMedia.mediaId, media.id))
        .where(eq(listingMedia.listingId, r.listing.id))
        .orderBy(listingMedia.displayOrder);

      const priceFormatted = r.listing.priceType === 'negotiable'
        ? 'توافقی'
        : r.listing.priceAmount
          ? `${Number(r.listing.priceAmount).toLocaleString('fa-IR')} تومان`
          : 'توافقی';

      results.push({
        id: r.listing.id,
        businessId: r.business.id,
        createdById: r.listing.createdById,
        title: r.listing.title,
        category: r.listing.categorySlug,
        city: r.listing.city,
        price: priceFormatted,
        timeAgo: 'ثبت شده در سیستم',
        images: mediaRows.map(m => m.url),
        image: mediaRows[0]?.url || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
        author: {
          id: r.business.id,
          name: r.business.name,
          rating: r.profile?.rating ? Number(r.profile.rating) : 5.0,
          verified: r.business.isVerified,
          avatar: r.profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        },
        description: r.listing.description,
        status: r.listing.status,
        activityType: r.listing.activityType,
        publishedAt: r.listing.publishedAt,
        createdAt: r.listing.createdAt,
      });
    }

    return results;
  }
}

export const listingRepository = new PostgresListingRepository();
