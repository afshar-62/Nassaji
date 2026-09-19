import { db } from '../../../src/db/index.ts';
import {
  profiles,
  profileCredentials,
  profileLocations,
  profileRatings,
  profileAuditEvents,
  listings,
  businessMemberships,
  businesses,
} from '../../../src/db/schema.ts';
import { eq, and, desc, sql } from 'drizzle-orm';
import {
  IProfilesRepository,
  ProfileRecord,
  ProfileCredentialRecord,
  ProfileLocationRecord,
  ProfileRatingRecord,
} from './profiles.repository.port.ts';
import {
  CreateProfileDTO,
  UpdateProfileDTO,
  ProfileCredentialDTO,
  ProfileLocationDTO,
  RateProfileDTO,
} from './profiles.dto.ts';

export class PostgresProfilesRepository implements IProfilesRepository {
  async findById(id: string): Promise<ProfileRecord | null> {
    const [result] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);
    return (result as ProfileRecord) || null;
  }

  async findBySlug(slug: string): Promise<ProfileRecord | null> {
    const [result] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.slug, slug))
      .limit(1);
    return (result as ProfileRecord) || null;
  }

  async findByAccountId(accountId: string): Promise<ProfileRecord[]> {
    const records = await db
      .select()
      .from(profiles)
      .where(eq(profiles.accountId, accountId))
      .orderBy(desc(profiles.createdAt));
    return records as ProfileRecord[];
  }

  async findPersonalProfileByAccountId(accountId: string): Promise<ProfileRecord | null> {
    const [result] = await db
      .select()
      .from(profiles)
      .where(
        and(
          eq(profiles.accountId, accountId),
          eq(profiles.profileType, 'PERSON')
        )
      )
      .limit(1);
    return (result as ProfileRecord) || null;
  }

  async create(
    accountId: string,
    data: CreateProfileDTO & { slug: string; status: 'INCOMPLETE' | 'ACTIVE' }
  ): Promise<ProfileRecord> {
    const socialLinksStr = data.socialLinks
      ? typeof data.socialLinks === 'string'
        ? data.socialLinks
        : JSON.stringify(data.socialLinks)
      : null;

    const [created] = await db
      .insert(profiles)
      .values({
        accountId,
        profileType: data.profileType || 'PERSON',
        status: data.status || 'INCOMPLETE',
        slug: data.slug,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        businessName: data.businessName || null,
        workGroup: data.workGroup,
        activityDomain: data.activityDomain,
        specialties: data.specialties || [],
        avatarUrl: data.avatarUrl || null,
        headerUrl: data.headerUrl || null,
        bio: data.bio || null,
        yearsActive: data.yearsActive !== undefined && data.yearsActive !== null ? Number(data.yearsActive) : null,
        primaryProducts: data.primaryProducts || [],
        secondaryProducts: data.secondaryProducts || [],
        services: data.services || [],
        capacitySummary: data.capacitySummary || null,
        workingHours: data.workingHours || null,
        workingDays: data.workingDays || [],
        geographicScope: data.geographicScope || null,
        collaborationModes: data.collaborationModes || [],
        shippingCapability: !!data.shippingCapability,
        onsiteServiceCapability: !!data.onsiteServiceCapability,
        phone: data.phone || null,
        mobile: data.mobile || null,
        whatsapp: data.whatsapp || null,
        telegram: data.telegram || null,
        email: data.email || null,
        websiteUrl: data.websiteUrl || null,
        websiteStatus: 'SUBMITTED',
        socialLinks: socialLinksStr,
      })
      .returning();

    // Insert credentials if present
    if (data.credentials && data.credentials.length > 0) {
      for (const cred of data.credentials) {
        if (cred.title && cred.fileUrl) {
          await this.addCredential(created.id, cred);
        }
      }
    }

    // Insert locations if present
    if (data.locations && data.locations.length > 0) {
      for (const loc of data.locations) {
        if (loc.unitTitle && loc.province && loc.city && loc.address) {
          await this.addLocation(created.id, loc);
        }
      }
    }

    return created as ProfileRecord;
  }

  async update(id: string, data: Partial<UpdateProfileDTO>): Promise<ProfileRecord> {
    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.profileType !== undefined) updatePayload.profileType = data.profileType;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.slug !== undefined) updatePayload.slug = data.slug;
    if (data.firstName !== undefined) updatePayload.firstName = data.firstName;
    if (data.lastName !== undefined) updatePayload.lastName = data.lastName;
    if (data.businessName !== undefined) updatePayload.businessName = data.businessName;
    if (data.workGroup !== undefined) updatePayload.workGroup = data.workGroup;
    if (data.activityDomain !== undefined) updatePayload.activityDomain = data.activityDomain;
    if (data.specialties !== undefined) updatePayload.specialties = data.specialties;
    if (data.avatarUrl !== undefined) updatePayload.avatarUrl = data.avatarUrl;
    if (data.headerUrl !== undefined) updatePayload.headerUrl = data.headerUrl;
    if (data.bio !== undefined) updatePayload.bio = data.bio;
    if (data.yearsActive !== undefined) updatePayload.yearsActive = data.yearsActive !== null ? Number(data.yearsActive) : null;
    if (data.primaryProducts !== undefined) updatePayload.primaryProducts = data.primaryProducts;
    if (data.secondaryProducts !== undefined) updatePayload.secondaryProducts = data.secondaryProducts;
    if (data.services !== undefined) updatePayload.services = data.services;
    if (data.capacitySummary !== undefined) updatePayload.capacitySummary = data.capacitySummary;
    if (data.workingHours !== undefined) updatePayload.workingHours = data.workingHours;
    if (data.workingDays !== undefined) updatePayload.workingDays = data.workingDays;
    if (data.geographicScope !== undefined) updatePayload.geographicScope = data.geographicScope;
    if (data.collaborationModes !== undefined) updatePayload.collaborationModes = data.collaborationModes;
    if (data.shippingCapability !== undefined) updatePayload.shippingCapability = data.shippingCapability;
    if (data.onsiteServiceCapability !== undefined) updatePayload.onsiteServiceCapability = data.onsiteServiceCapability;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.mobile !== undefined) updatePayload.mobile = data.mobile;
    if (data.whatsapp !== undefined) updatePayload.whatsapp = data.whatsapp;
    if (data.telegram !== undefined) updatePayload.telegram = data.telegram;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.websiteUrl !== undefined) updatePayload.websiteUrl = data.websiteUrl;
    if (data.socialLinks !== undefined) {
      updatePayload.socialLinks = typeof data.socialLinks === 'string'
        ? data.socialLinks
        : JSON.stringify(data.socialLinks);
    }

    const [updated] = await db
      .update(profiles)
      .set(updatePayload)
      .where(eq(profiles.id, id))
      .returning();

    return updated as ProfileRecord;
  }

  async getCredentials(profileId: string): Promise<ProfileCredentialRecord[]> {
    const creds = await db
      .select()
      .from(profileCredentials)
      .where(eq(profileCredentials.profileId, profileId))
      .orderBy(desc(profileCredentials.createdAt));
    return creds as ProfileCredentialRecord[];
  }

  async addCredential(profileId: string, credential: ProfileCredentialDTO): Promise<ProfileCredentialRecord> {
    const [inserted] = await db
      .insert(profileCredentials)
      .values({
        profileId,
        title: credential.title,
        issueDate: credential.issueDate || null,
        validityDate: credential.validityDate || null,
        fileUrl: credential.fileUrl,
        description: credential.description || null,
        isOfficiallyVerified: false, // Strictly unverified unless external verified audit occurs
      })
      .returning();
    return inserted as ProfileCredentialRecord;
  }

  async removeCredential(credentialId: string, profileId: string): Promise<boolean> {
    const deleted = await db
      .delete(profileCredentials)
      .where(
        and(
          eq(profileCredentials.id, credentialId),
          eq(profileCredentials.profileId, profileId)
        )
      )
      .returning();
    return deleted.length > 0;
  }

  async getLocations(profileId: string): Promise<ProfileLocationRecord[]> {
    const locs = await db
      .select()
      .from(profileLocations)
      .where(eq(profileLocations.profileId, profileId))
      .orderBy(desc(profileLocations.isPrimary), desc(profileLocations.createdAt));
    return locs as ProfileLocationRecord[];
  }

  async addLocation(profileId: string, location: ProfileLocationDTO): Promise<ProfileLocationRecord> {
    const [inserted] = await db
      .insert(profileLocations)
      .values({
        profileId,
        unitTitle: location.unitTitle,
        unitType: location.unitType || 'workshop',
        country: location.country || 'ایران',
        province: location.province,
        city: location.city,
        area: location.area || null,
        address: location.address,
        postalCode: location.postalCode || null,
        phone: location.phone || null,
        latitude: location.latitude !== null && location.latitude !== undefined ? location.latitude.toString() : null,
        longitude: location.longitude !== null && location.longitude !== undefined ? location.longitude.toString() : null,
        isApproximate: location.isApproximate ?? (location.latitude === null || location.latitude === undefined),
        isPrimary: location.isPrimary ?? false,
      })
      .returning();
    return inserted as ProfileLocationRecord;
  }

  async removeLocation(locationId: string, profileId: string): Promise<boolean> {
    const deleted = await db
      .delete(profileLocations)
      .where(
        and(
          eq(profileLocations.id, locationId),
          eq(profileLocations.profileId, profileId)
        )
      )
      .returning();
    return deleted.length > 0;
  }

  async recordRating(
    profileId: string,
    raterAccountId: string,
    rating: RateProfileDTO
  ): Promise<ProfileRatingRecord> {
    const [inserted] = await db
      .insert(profileRatings)
      .values({
        profileId,
        raterAccountId,
        score: Math.min(5, Math.max(1, Math.round(rating.score))),
        interactionType: rating.interactionType,
        privateRationale: rating.privateRationale || null,
      })
      .returning();
    return inserted as ProfileRatingRecord;
  }

  async getExistingRating(profileId: string, raterAccountId: string): Promise<ProfileRatingRecord | null> {
    const [existing] = await db
      .select()
      .from(profileRatings)
      .where(
        and(
          eq(profileRatings.profileId, profileId),
          eq(profileRatings.raterAccountId, raterAccountId)
        )
      )
      .limit(1);
    return (existing as ProfileRatingRecord) || null;
  }

  async updateRatingAggregate(profileId: string): Promise<{ rating: string; ratingsCount: number }> {
    const [agg] = await db
      .select({
        avgScore: sql<string>`COALESCE(ROUND(AVG(${profileRatings.score})::numeric, 2), 5.00)::text`,
        countScores: sql<number>`COUNT(${profileRatings.id})::int`,
      })
      .from(profileRatings)
      .where(eq(profileRatings.profileId, profileId));

    const newRating = agg?.avgScore || '5.00';
    const newCount = agg?.countScores || 0;

    await db
      .update(profiles)
      .set({
        rating: newRating,
        ratingsCount: newCount,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profileId));

    return { rating: newRating, ratingsCount: newCount };
  }

  async recordAuditEvent(
    profileId: string,
    actorId: string,
    eventType: string,
    metadata?: string
  ): Promise<void> {
    await db.insert(profileAuditEvents).values({
      profileId,
      actorId,
      eventType,
      metadata: metadata || null,
    });
  }

  async getListingsForProfile(accountId: string): Promise<any[]> {
    // Return published listings created by businesses associated with this account or directly by this creator
    const results = await db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        activityType: listings.activityType,
        commodityType: listings.commodityType,
        priceType: listings.priceType,
        priceAmount: listings.priceAmount,
        unit: listings.unit,
        city: listings.city,
        province: listings.province,
        status: listings.status,
        publishedAt: listings.publishedAt,
        businessName: businesses.name,
      })
      .from(listings)
      .innerJoin(businesses, eq(listings.businessId, businesses.id))
      .where(
        and(
          eq(listings.createdById, accountId),
          eq(listings.status, 'published')
        )
      )
      .orderBy(desc(listings.publishedAt))
      .limit(20);

    return results;
  }
}

export const postgresProfilesRepository = new PostgresProfilesRepository();
