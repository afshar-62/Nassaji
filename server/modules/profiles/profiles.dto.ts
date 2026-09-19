export type ProfileType = 'PERSON' | 'ORGANIZATION';
export type ProfileStatus = 'INCOMPLETE' | 'ACTIVE' | 'SUSPENDED';
export type WebsiteStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'RESTRICTED' | 'REJECTED' | 'SUSPENDED';
export type UnitType = 'workshop' | 'office' | 'warehouse' | 'showroom' | 'distribution_center' | 'service_center';
export type InteractionType = 'deal' | 'collaboration' | 'inquiry' | 'service_order';

export interface ProfileCredentialDTO {
  id?: string;
  profileId?: string;
  title: string;
  issueDate?: string | null;
  validityDate?: string | null;
  fileUrl: string;
  description?: string | null;
  isOfficiallyVerified: boolean;
  createdAt?: string;
}

export interface ProfileLocationDTO {
  id?: string;
  profileId?: string;
  unitTitle: string;
  unitType: UnitType;
  country: string;
  province: string;
  city: string;
  area?: string | null;
  address: string;
  postalCode?: string | null;
  phone?: string | null;
  latitude: number | null;
  longitude: number | null;
  isApproximate: boolean;
  isPrimary: boolean;
  createdAt?: string;
}

export interface BaselineValidationResult {
  isComplete: boolean;
  profileType: ProfileType;
  missingFields: string[];
  summaryMessage: string;
}

export interface CreateProfileDTO {
  profileType: ProfileType;
  slug?: string;
  firstName?: string | null;
  lastName?: string | null;
  businessName?: string | null;
  workGroup: string;
  activityDomain: string;
  specialties: string[];
  avatarUrl?: string | null;
  headerUrl?: string | null;
  bio?: string | null;
  yearsActive?: number | null;
  primaryProducts?: string[];
  secondaryProducts?: string[];
  services?: string[];
  capacitySummary?: string | null;
  workingHours?: string | null;
  workingDays?: string[];
  geographicScope?: string | null;
  collaborationModes?: string[];
  shippingCapability?: boolean;
  onsiteServiceCapability?: boolean;
  phone?: string | null;
  mobile?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  socialLinks?: Record<string, string> | string | null;
  credentials?: ProfileCredentialDTO[];
  locations?: ProfileLocationDTO[];
}

export interface UpdateProfileDTO {
  profileType?: ProfileType;
  slug?: string;
  status?: ProfileStatus;
  firstName?: string | null;
  lastName?: string | null;
  businessName?: string | null;
  workGroup?: string;
  activityDomain?: string;
  specialties?: string[];
  avatarUrl?: string | null;
  headerUrl?: string | null;
  bio?: string | null;
  yearsActive?: number | null;
  primaryProducts?: string[];
  secondaryProducts?: string[];
  services?: string[];
  capacitySummary?: string | null;
  workingHours?: string | null;
  workingDays?: string[];
  geographicScope?: string | null;
  collaborationModes?: string[];
  shippingCapability?: boolean;
  onsiteServiceCapability?: boolean;
  phone?: string | null;
  mobile?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  socialLinks?: Record<string, string> | string | null;
  credentials?: ProfileCredentialDTO[];
  locations?: ProfileLocationDTO[];
}

export interface RateProfileDTO {
  score: number; // 1 to 5
  interactionType: InteractionType;
  privateRationale?: string;
}

// Public DTO - Strictly safe, strips sensitive owner identifiers and private ratings rationale
export interface PublicProfileDTO {
  id: string;
  slug: string;
  profileType: ProfileType;
  status: ProfileStatus;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  businessName?: string | null;
  workGroup: string;
  activityDomain: string;
  specialties: string[];
  avatarUrl?: string | null;
  headerUrl?: string | null;
  bio?: string | null;
  yearsActive?: number | null;
  primaryProducts: string[];
  secondaryProducts: string[];
  services: string[];
  capacitySummary?: string | null;
  workingHours?: string | null;
  workingDays: string[];
  geographicScope?: string | null;
  collaborationModes: string[];
  shippingCapability: boolean;
  onsiteServiceCapability: boolean;
  contacts: {
    phone?: string | null;
    mobile?: string | null;
    whatsapp?: string | null;
    telegram?: string | null;
    email?: string | null;
  };
  website: {
    url?: string | null;
    status: WebsiteStatus;
  };
  socialLinks: Record<string, string>;
  rating: number;
  ratingsCount: number;
  isVerified: boolean;
  credentials: ProfileCredentialDTO[];
  locations: ProfileLocationDTO[];
  listingsCount: number;
  listings: any[];
  createdAt: string;
  updatedAt: string;
}

// Owner DTO - Full access for owner including account context, draft status and baseline validation report
export interface OwnerProfileDTO extends PublicProfileDTO {
  accountId: string;
  baseline: BaselineValidationResult;
  isOwner: true;
}
