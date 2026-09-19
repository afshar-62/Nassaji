import {
  IBusinessRepository,
  BusinessEntity,
  BusinessProfileEntity,
  BusinessMembershipEntity,
  DetailedBusinessProfile,
  CreateBusinessDTO,
  UpsertBusinessProfileDTO,
} from './businesses.repository.port.ts';
import { businessRepository } from './businesses.repository.postgres.ts';
import { AuthenticatedUser, RequestAuthContext } from '../../types/auth.ts';

export interface CreateBusinessInput {
  name: string;
  slug: string;
  city: string;
  province?: string;
  phone?: string | null;
  registrationNumber?: string | null;
  licenseNumber?: string | null;
  address?: string | null;
  description?: string | null;
  managerName?: string | null;
  workshopAreaSqm?: number | null;
  activeMachinesCount?: number | null;
  personnelCount?: number | null;
  whatsapp?: string | null;
  verifiedBadges?: string[];
}

export interface PublicBusinessProfileDTO {
  id: string;
  name: string;
  slug: string;
  isVerified: boolean;
  phone?: string | null;
  province: string;
  city: string;
  address?: string | null;
  registrationNumber?: string | null;
  licenseNumber?: string | null;
  profile: {
    description?: string | null;
    managerName?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    workshopAreaSqm?: number | null;
    activeMachinesCount?: number | null;
    personnelCount?: number | null;
    verifiedBadges: string[];
    whatsapp?: string | null;
    telegram?: string | null;
    website?: string | null;
    rating: number;
    reviewsCount: number;
  };
  contacts: {
    phone?: string | null;
    mobile?: string | null;
    whatsapp?: string | null;
    telegram?: string | null;
    website?: string | null;
  };
  location: {
    province: string;
    city: string;
    address: string;
  };
}

export class BusinessService {
  constructor(private readonly businessRepo: IBusinessRepository = businessRepository) {}

  async getBusinessById(idOrSlug: string): Promise<BusinessEntity | null> {
    return this.businessRepo.findById(idOrSlug);
  }

  async getProfileByBusinessId(idOrSlug: string): Promise<PublicBusinessProfileDTO | null> {
    const data: DetailedBusinessProfile | null = await this.businessRepo.findCompleteBusinessProfile(idOrSlug);
    if (!data) {
      return null;
    }

    const { business, profile } = data;

    return {
      id: business.id,
      name: business.name,
      slug: business.slug,
      isVerified: business.isVerified,
      phone: business.phone,
      province: business.province,
      city: business.city,
      address: business.address,
      registrationNumber: business.registrationNumber,
      licenseNumber: business.licenseNumber,
      profile: {
        description: profile?.description || null,
        managerName: profile?.managerName || null,
        avatarUrl: profile?.avatarUrl || null,
        coverUrl: profile?.coverUrl || null,
        workshopAreaSqm: profile?.workshopAreaSqm || null,
        activeMachinesCount: profile?.activeMachinesCount || null,
        personnelCount: profile?.personnelCount || null,
        verifiedBadges: profile?.verifiedBadges || [],
        whatsapp: profile?.whatsapp || null,
        telegram: profile?.telegram || null,
        website: profile?.website || null,
        rating: profile?.rating !== undefined ? profile.rating : 5.0,
        reviewsCount: profile?.reviewsCount || 0,
      },
      contacts: {
        phone: business.phone,
        whatsapp: profile?.whatsapp || null,
        telegram: profile?.telegram || null,
        website: profile?.website || null,
      },
      location: {
        province: business.province,
        city: business.city,
        address: business.address || `${business.province}، ${business.city}`,
      },
    };
  }

  async createBusiness(
    creator: AuthenticatedUser,
    input: CreateBusinessInput
  ): Promise<{
    business: BusinessEntity;
    membership: BusinessMembershipEntity;
    profile: BusinessProfileEntity | null;
  }> {
    if (!creator || !creator.id) {
      throw new Error('CREATOR_REQUIRED: شناسه کاربر ایجادکننده الزامی است.');
    }

    const slugClean = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!slugClean || slugClean.length < 3) {
      throw new Error('INVALID_SLUG: شناسه کسب‌وکار باید حداقل ۳ کاراکتر و شامل حروف و ارقام انگلیسی باشد.');
    }

    const dto: CreateBusinessDTO = {
      name: input.name.trim(),
      slug: slugClean,
      createdById: creator.id,
      city: input.city || 'تهران',
      province: input.province || 'تهران',
      phone: input.phone || null,
      registrationNumber: input.registrationNumber || null,
      licenseNumber: input.licenseNumber || null,
      address: input.address || null,
      description: input.description || null,
      managerName: input.managerName || creator.name,
      workshopAreaSqm: input.workshopAreaSqm || null,
      activeMachinesCount: input.activeMachinesCount || null,
      personnelCount: input.personnelCount || null,
      whatsapp: input.whatsapp || input.phone || null,
      verifiedBadges: input.verifiedBadges || [],
    };

    return this.businessRepo.createBusiness(dto);
  }

  async updateProfile(
    actorAuth: RequestAuthContext,
    businessIdOrSlug: string,
    dto: UpsertBusinessProfileDTO
  ): Promise<PublicBusinessProfileDTO> {
    const business = await this.businessRepo.findById(businessIdOrSlug);
    if (!business) {
      throw new Error('BUSINESS_NOT_FOUND');
    }

    // Authorization Guard: Actor must have membership in this specific business as owner or manager
    const actorMembership = actorAuth.memberships.find(m => m.businessId === business.id);
    if (!actorMembership || (actorMembership.role !== 'owner' && actorMembership.role !== 'manager')) {
      throw new Error('FORBIDDEN_BUSINESS_MUTATION: شما دسترسی ویرایش اطلاعات و پروفایل این کارگاه را ندارید.');
    }

    await this.businessRepo.upsertProfile(business.id, dto);

    const updatedProfile = await this.getProfileByBusinessId(business.id);
    if (!updatedProfile) {
      throw new Error('PROFILE_NOT_FOUND');
    }
    return updatedProfile;
  }

  async addMember(
    actorAuth: RequestAuthContext,
    businessId: string,
    targetUserId: string,
    role: 'owner' | 'manager' | 'operator'
  ): Promise<BusinessMembershipEntity> {
    const business = await this.businessRepo.findById(businessId);
    if (!business) {
      throw new Error('BUSINESS_NOT_FOUND');
    }

    // Authorization Guard: Only 'owner' can manage memberships
    const actorMembership = actorAuth.memberships.find(m => m.businessId === business.id);
    if (!actorMembership || actorMembership.role !== 'owner') {
      throw new Error('FORBIDDEN_NOT_OWNER: تنها مالک کسب‌وکار مجاز به مدیریت اعضا و دسترسی‌ها است.');
    }

    if (!['owner', 'manager', 'operator'].includes(role)) {
      throw new Error('INVALID_ROLE: نقش کاربری نامعتبر است.');
    }

    return this.businessRepo.addMember(business.id, targetUserId, role);
  }

  async listMembers(actorAuth: RequestAuthContext, businessId: string): Promise<any[]> {
    const business = await this.businessRepo.findById(businessId);
    if (!business) {
      throw new Error('BUSINESS_NOT_FOUND');
    }

    // Authorization Guard: Actor must belong to this business
    const isMember = actorAuth.memberships.some(m => m.businessId === business.id);
    if (!isMember) {
      throw new Error('FORBIDDEN: شما عضو این کارگاه نیستید.');
    }

    return this.businessRepo.listMembers(business.id);
  }
}

export const businessService = new BusinessService();
