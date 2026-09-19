import { db } from '../../../src/db/index.ts';
import { businesses, businessProfiles, businessMemberships, users } from '../../../src/db/schema.ts';
import { eq, and } from 'drizzle-orm';
import {
  IBusinessRepository,
  BusinessEntity,
  BusinessProfileEntity,
  BusinessMembershipEntity,
  DetailedBusinessProfile,
  CreateBusinessDTO,
  UpsertBusinessProfileDTO,
} from './businesses.repository.port.ts';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class PostgresBusinessRepository implements IBusinessRepository {
  async findById(idOrSlug: string): Promise<BusinessEntity | null> {
    const isUuid = UUID_REGEX.test(idOrSlug);
    const [row] = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        slug: businesses.slug,
        registrationNumber: businesses.registrationNumber,
        licenseNumber: businesses.licenseNumber,
        phone: businesses.phone,
        city: businesses.city,
        province: businesses.province,
        address: businesses.address,
        isVerified: businesses.isVerified,
        createdAt: businesses.createdAt,
      })
      .from(businesses)
      .where(isUuid ? eq(businesses.id, idOrSlug) : eq(businesses.slug, idOrSlug))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      registrationNumber: row.registrationNumber,
      licenseNumber: row.licenseNumber,
      phone: row.phone,
      city: row.city,
      province: row.province,
      address: row.address,
      isVerified: row.isVerified,
      createdAt: row.createdAt,
    };
  }

  async findBySlug(slug: string): Promise<BusinessEntity | null> {
    const [row] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.slug, slug))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      registrationNumber: row.registrationNumber,
      licenseNumber: row.licenseNumber,
      phone: row.phone,
      city: row.city,
      province: row.province,
      address: row.address,
      isVerified: row.isVerified,
      createdAt: row.createdAt,
    };
  }

  async findProfileByBusinessId(businessId: string): Promise<BusinessProfileEntity | null> {
    const [row] = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.businessId, businessId))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      businessId: row.businessId,
      description: row.description,
      managerName: row.managerName,
      avatarUrl: row.avatarUrl,
      coverUrl: row.coverUrl,
      workshopAreaSqm: row.workshopAreaSqm,
      activeMachinesCount: row.activeMachinesCount,
      personnelCount: row.personnelCount,
      verifiedBadges: row.verifiedBadges,
      whatsapp: row.whatsapp,
      telegram: row.telegram,
      website: row.website,
      rating: Number(row.rating),
      reviewsCount: row.reviewsCount,
      updatedAt: row.updatedAt,
    };
  }

  async findCompleteBusinessProfile(businessIdOrSlug: string): Promise<DetailedBusinessProfile | null> {
    const business = await this.findById(businessIdOrSlug);
    if (!business) {
      return null;
    }

    const profile = await this.findProfileByBusinessId(business.id);
    return {
      business,
      profile,
    };
  }

  async createBusiness(dto: CreateBusinessDTO): Promise<{
    business: BusinessEntity;
    membership: BusinessMembershipEntity;
    profile: BusinessProfileEntity | null;
  }> {
    return await db.transaction(async (tx) => {
      // 1. Slug uniqueness guard
      const [existingSlug] = await tx
        .select({ id: businesses.id })
        .from(businesses)
        .where(eq(businesses.slug, dto.slug))
        .limit(1);

      if (existingSlug) {
        throw new Error('DUPLICATE_SLUG: شناسه یا نام کاربری کسب‌وکار قبلاً ثبت شده است.');
      }

      // 2. Insert business
      const [newBusiness] = await tx
        .insert(businesses)
        .values({
          name: dto.name,
          slug: dto.slug,
          createdById: dto.createdById,
          city: dto.city,
          province: dto.province,
          phone: dto.phone || null,
          registrationNumber: dto.registrationNumber || null,
          licenseNumber: dto.licenseNumber || null,
          address: dto.address || null,
          isVerified: false,
        })
        .returning();

      // 3. Atomically insert initial owner membership (INVARIANT: Business must not exist without owner)
      const [ownerMembership] = await tx
        .insert(businessMemberships)
        .values({
          userId: dto.createdById,
          businessId: newBusiness.id,
          role: 'owner',
          isDefault: true,
        })
        .returning();

      // 4. Create initial business profile record
      const [newProfile] = await tx
        .insert(businessProfiles)
        .values({
          businessId: newBusiness.id,
          description: dto.description || null,
          managerName: dto.managerName || null,
          workshopAreaSqm: dto.workshopAreaSqm || null,
          activeMachinesCount: dto.activeMachinesCount || null,
          personnelCount: dto.personnelCount || null,
          whatsapp: dto.whatsapp || dto.phone || null,
          verifiedBadges: dto.verifiedBadges || [],
        })
        .returning();

      return {
        business: {
          id: newBusiness.id,
          name: newBusiness.name,
          slug: newBusiness.slug,
          registrationNumber: newBusiness.registrationNumber,
          licenseNumber: newBusiness.licenseNumber,
          phone: newBusiness.phone,
          city: newBusiness.city,
          province: newBusiness.province,
          address: newBusiness.address,
          isVerified: newBusiness.isVerified,
          createdAt: newBusiness.createdAt,
        },
        membership: {
          id: ownerMembership.id,
          userId: ownerMembership.userId,
          businessId: ownerMembership.businessId,
          role: ownerMembership.role as 'owner' | 'manager' | 'operator',
          isDefault: ownerMembership.isDefault,
          createdAt: ownerMembership.createdAt,
        },
        profile: newProfile ? {
          id: newProfile.id,
          businessId: newProfile.businessId,
          description: newProfile.description,
          managerName: newProfile.managerName,
          avatarUrl: newProfile.avatarUrl,
          coverUrl: newProfile.coverUrl,
          workshopAreaSqm: newProfile.workshopAreaSqm,
          activeMachinesCount: newProfile.activeMachinesCount,
          personnelCount: newProfile.personnelCount,
          verifiedBadges: newProfile.verifiedBadges,
          whatsapp: newProfile.whatsapp,
          telegram: newProfile.telegram,
          website: newProfile.website,
          rating: Number(newProfile.rating),
          reviewsCount: newProfile.reviewsCount,
          updatedAt: newProfile.updatedAt,
        } : null,
      };
    });
  }

  async upsertProfile(businessId: string, dto: UpsertBusinessProfileDTO): Promise<BusinessProfileEntity> {
    return await db.transaction(async (tx) => {
      // If address or phone provided, update businesses table as well
      if (dto.address !== undefined || dto.phone !== undefined) {
        const updateBiz: Record<string, any> = { updatedAt: new Date() };
        if (dto.address !== undefined) updateBiz.address = dto.address;
        if (dto.phone !== undefined) updateBiz.phone = dto.phone;
        await tx.update(businesses).set(updateBiz).where(eq(businesses.id, businessId));
      }

      // Check if profile exists
      const [existing] = await tx
        .select()
        .from(businessProfiles)
        .where(eq(businessProfiles.businessId, businessId))
        .limit(1);

      if (existing) {
        const updatePayload: Record<string, any> = { updatedAt: new Date() };
        if (dto.description !== undefined) updatePayload.description = dto.description;
        if (dto.managerName !== undefined) updatePayload.managerName = dto.managerName;
        if (dto.avatarUrl !== undefined) updatePayload.avatarUrl = dto.avatarUrl;
        if (dto.coverUrl !== undefined) updatePayload.coverUrl = dto.coverUrl;
        if (dto.workshopAreaSqm !== undefined) updatePayload.workshopAreaSqm = dto.workshopAreaSqm;
        if (dto.activeMachinesCount !== undefined) updatePayload.activeMachinesCount = dto.activeMachinesCount;
        if (dto.personnelCount !== undefined) updatePayload.personnelCount = dto.personnelCount;
        if (dto.verifiedBadges !== undefined) updatePayload.verifiedBadges = dto.verifiedBadges;
        if (dto.whatsapp !== undefined) updatePayload.whatsapp = dto.whatsapp;
        if (dto.telegram !== undefined) updatePayload.telegram = dto.telegram;
        if (dto.website !== undefined) updatePayload.website = dto.website;

        const [updated] = await tx
          .update(businessProfiles)
          .set(updatePayload)
          .where(eq(businessProfiles.businessId, businessId))
          .returning();

        return {
          id: updated.id,
          businessId: updated.businessId,
          description: updated.description,
          managerName: updated.managerName,
          avatarUrl: updated.avatarUrl,
          coverUrl: updated.coverUrl,
          workshopAreaSqm: updated.workshopAreaSqm,
          activeMachinesCount: updated.activeMachinesCount,
          personnelCount: updated.personnelCount,
          verifiedBadges: updated.verifiedBadges,
          whatsapp: updated.whatsapp,
          telegram: updated.telegram,
          website: updated.website,
          rating: Number(updated.rating),
          reviewsCount: updated.reviewsCount,
          updatedAt: updated.updatedAt,
        };
      } else {
        const [inserted] = await tx
          .insert(businessProfiles)
          .values({
            businessId,
            description: dto.description || null,
            managerName: dto.managerName || null,
            avatarUrl: dto.avatarUrl || null,
            coverUrl: dto.coverUrl || null,
            workshopAreaSqm: dto.workshopAreaSqm || null,
            activeMachinesCount: dto.activeMachinesCount || null,
            personnelCount: dto.personnelCount || null,
            verifiedBadges: dto.verifiedBadges || [],
            whatsapp: dto.whatsapp || null,
            telegram: dto.telegram || null,
            website: dto.website || null,
          })
          .returning();

        return {
          id: inserted.id,
          businessId: inserted.businessId,
          description: inserted.description,
          managerName: inserted.managerName,
          avatarUrl: inserted.avatarUrl,
          coverUrl: inserted.coverUrl,
          workshopAreaSqm: inserted.workshopAreaSqm,
          activeMachinesCount: inserted.activeMachinesCount,
          personnelCount: inserted.personnelCount,
          verifiedBadges: inserted.verifiedBadges,
          whatsapp: inserted.whatsapp,
          telegram: inserted.telegram,
          website: inserted.website,
          rating: Number(inserted.rating),
          reviewsCount: inserted.reviewsCount,
          updatedAt: inserted.updatedAt,
        };
      }
    });
  }

  async addMember(
    businessId: string,
    userId: string,
    role: 'owner' | 'manager' | 'operator',
    isDefault: boolean = false
  ): Promise<BusinessMembershipEntity> {
    const [existing] = await db
      .select()
      .from(businessMemberships)
      .where(and(eq(businessMemberships.businessId, businessId), eq(businessMemberships.userId, userId)))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(businessMemberships)
        .set({ role })
        .where(eq(businessMemberships.id, existing.id))
        .returning();

      return {
        id: updated.id,
        userId: updated.userId,
        businessId: updated.businessId,
        role: updated.role as any,
        isDefault: updated.isDefault,
        createdAt: updated.createdAt,
      };
    }

    const [inserted] = await db
      .insert(businessMemberships)
      .values({
        businessId,
        userId,
        role,
        isDefault,
      })
      .returning();

    return {
      id: inserted.id,
      userId: inserted.userId,
      businessId: inserted.businessId,
      role: inserted.role as any,
      isDefault: inserted.isDefault,
      createdAt: inserted.createdAt,
    };
  }

  async findMembership(businessId: string, userId: string): Promise<BusinessMembershipEntity | null> {
    const [row] = await db
      .select()
      .from(businessMemberships)
      .where(and(eq(businessMemberships.businessId, businessId), eq(businessMemberships.userId, userId)))
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      userId: row.userId,
      businessId: row.businessId,
      role: row.role as any,
      isDefault: row.isDefault,
      createdAt: row.createdAt,
    };
  }

  async listMembers(businessId: string): Promise<any[]> {
    return await db
      .select({
        membershipId: businessMemberships.id,
        role: businessMemberships.role,
        isDefault: businessMemberships.isDefault,
        createdAt: businessMemberships.createdAt,
        userId: users.id,
        userName: users.name,
        userUid: users.uid,
        userEmail: users.email,
        userMobile: users.mobile,
      })
      .from(businessMemberships)
      .innerJoin(users, eq(businessMemberships.userId, users.id))
      .where(eq(businessMemberships.businessId, businessId));
  }
}

export const businessRepository = new PostgresBusinessRepository();
