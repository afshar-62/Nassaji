import {
  CreateProfileDTO,
  UpdateProfileDTO,
  ProfileCredentialDTO,
  ProfileLocationDTO,
  RateProfileDTO,
  InteractionType,
} from './profiles.dto.ts';

export interface ProfileRecord {
  id: string;
  accountId: string;
  profileType: 'PERSON' | 'ORGANIZATION';
  status: 'INCOMPLETE' | 'ACTIVE' | 'SUSPENDED';
  slug: string;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  workGroup: string;
  activityDomain: string;
  specialties: string[];
  avatarUrl: string | null;
  headerUrl: string | null;
  bio: string | null;
  yearsActive: number | null;
  primaryProducts: string[] | null;
  secondaryProducts: string[] | null;
  services: string[] | null;
  capacitySummary: string | null;
  workingHours: string | null;
  workingDays: string[] | null;
  geographicScope: string | null;
  collaborationModes: string[] | null;
  shippingCapability: boolean;
  onsiteServiceCapability: boolean;
  phone: string | null;
  mobile: string | null;
  whatsapp: string | null;
  telegram: string | null;
  email: string | null;
  websiteUrl: string | null;
  websiteStatus: string;
  socialLinks: string | null;
  rating: string;
  ratingsCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileCredentialRecord {
  id: string;
  profileId: string;
  title: string;
  issueDate: string | null;
  validityDate: string | null;
  fileUrl: string;
  description: string | null;
  isOfficiallyVerified: boolean;
  createdAt: Date;
}

export interface ProfileLocationRecord {
  id: string;
  profileId: string;
  unitTitle: string;
  unitType: string;
  country: string;
  province: string;
  city: string;
  area: string | null;
  address: string;
  postalCode: string | null;
  phone: string | null;
  latitude: string | null;
  longitude: string | null;
  isApproximate: boolean;
  isPrimary: boolean;
  createdAt: Date;
}

export interface ProfileRatingRecord {
  id: string;
  profileId: string;
  raterAccountId: string;
  score: number;
  interactionType: string;
  privateRationale: string | null;
  createdAt: Date;
}

export interface IProfilesRepository {
  findById(id: string): Promise<ProfileRecord | null>;
  findBySlug(slug: string): Promise<ProfileRecord | null>;
  findByAccountId(accountId: string): Promise<ProfileRecord[]>;
  findPersonalProfileByAccountId(accountId: string): Promise<ProfileRecord | null>;
  create(accountId: string, data: CreateProfileDTO & { slug: string; status: 'INCOMPLETE' | 'ACTIVE' }): Promise<ProfileRecord>;
  update(id: string, data: Partial<UpdateProfileDTO>): Promise<ProfileRecord>;
  getCredentials(profileId: string): Promise<ProfileCredentialRecord[]>;
  addCredential(profileId: string, credential: ProfileCredentialDTO): Promise<ProfileCredentialRecord>;
  removeCredential(credentialId: string, profileId: string): Promise<boolean>;
  getLocations(profileId: string): Promise<ProfileLocationRecord[]>;
  addLocation(profileId: string, location: ProfileLocationDTO): Promise<ProfileLocationRecord>;
  removeLocation(locationId: string, profileId: string): Promise<boolean>;
  recordRating(profileId: string, raterAccountId: string, rating: RateProfileDTO): Promise<ProfileRatingRecord>;
  getExistingRating(profileId: string, raterAccountId: string): Promise<ProfileRatingRecord | null>;
  updateRatingAggregate(profileId: string): Promise<{ rating: string; ratingsCount: number }>;
  recordAuditEvent(profileId: string, actorId: string, eventType: string, metadata?: string): Promise<void>;
  getListingsForProfile(accountId: string): Promise<any[]>;
}
