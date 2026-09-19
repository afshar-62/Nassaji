export interface BusinessEntity {
  id: string;
  name: string;
  slug: string;
  registrationNumber?: string | null;
  licenseNumber?: string | null;
  phone?: string | null;
  city: string;
  province: string;
  address?: string | null;
  isVerified: boolean;
  createdAt: Date;
}

export interface BusinessProfileEntity {
  id: string;
  businessId: string;
  description?: string | null;
  managerName?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  workshopAreaSqm?: number | null;
  activeMachinesCount?: number | null;
  personnelCount?: number | null;
  verifiedBadges?: string[] | null;
  whatsapp?: string | null;
  telegram?: string | null;
  website?: string | null;
  rating: number;
  reviewsCount: number;
  updatedAt: Date;
}

export interface DetailedBusinessProfile {
  business: BusinessEntity;
  profile: BusinessProfileEntity | null;
}

export interface BusinessMembershipEntity {
  id: string;
  userId: string;
  businessId: string;
  role: 'owner' | 'manager' | 'operator';
  isDefault: boolean;
  createdAt: Date;
}

export interface CreateBusinessDTO {
  name: string;
  slug: string;
  createdById: string;
  city: string;
  province: string;
  phone?: string | null;
  registrationNumber?: string | null;
  licenseNumber?: string | null;
  address?: string | null;
  // Optional initial profile fields
  description?: string | null;
  managerName?: string | null;
  workshopAreaSqm?: number | null;
  activeMachinesCount?: number | null;
  personnelCount?: number | null;
  whatsapp?: string | null;
  verifiedBadges?: string[] | null;
}

export interface UpsertBusinessProfileDTO {
  description?: string | null;
  managerName?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  workshopAreaSqm?: number | null;
  activeMachinesCount?: number | null;
  personnelCount?: number | null;
  verifiedBadges?: string[] | null;
  whatsapp?: string | null;
  telegram?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface IBusinessRepository {
  findById(id: string): Promise<BusinessEntity | null>;
  findBySlug(slug: string): Promise<BusinessEntity | null>;
  findProfileByBusinessId(businessId: string): Promise<BusinessProfileEntity | null>;
  findCompleteBusinessProfile(businessIdOrSlug: string): Promise<DetailedBusinessProfile | null>;
  createBusiness(dto: CreateBusinessDTO): Promise<{
    business: BusinessEntity;
    membership: BusinessMembershipEntity;
    profile: BusinessProfileEntity | null;
  }>;
  upsertProfile(businessId: string, dto: UpsertBusinessProfileDTO): Promise<BusinessProfileEntity>;
  addMember(businessId: string, userId: string, role: 'owner' | 'manager' | 'operator', isDefault?: boolean): Promise<BusinessMembershipEntity>;
  findMembership(businessId: string, userId: string): Promise<BusinessMembershipEntity | null>;
  listMembers(businessId: string): Promise<any[]>;
}
