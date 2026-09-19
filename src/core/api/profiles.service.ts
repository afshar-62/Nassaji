import { apiClient } from './client.ts';

export type ProfileType = 'PERSON' | 'ORGANIZATION';
export type ProfileStatus = 'INCOMPLETE' | 'ACTIVE' | 'SUSPENDED';
export type WebsiteStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'RESTRICTED' | 'REJECTED' | 'SUSPENDED';
export type UnitType = 'workshop' | 'office' | 'warehouse' | 'showroom' | 'distribution_center' | 'service_center';

export interface ProfileCredential {
  id?: string;
  title: string;
  issueDate?: string | null;
  validityDate?: string | null;
  fileUrl: string;
  description?: string | null;
  isOfficiallyVerified: boolean;
}

export interface ProfileLocation {
  id?: string;
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
}

export interface BaselineValidation {
  isComplete: boolean;
  profileType: ProfileType;
  missingFields: string[];
  summaryMessage: string;
}

export interface PublicProfile {
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
  credentials: ProfileCredential[];
  locations: ProfileLocation[];
  listingsCount: number;
  listings: any[];
  createdAt: string;
  updatedAt: string;
}

export interface OwnerProfile extends PublicProfile {
  accountId: string;
  baseline: BaselineValidation;
  isOwner: true;
}

export const profilesService = {
  // Fetch public profile by UUID or slug
  async fetchPublicProfile(idOrSlug: string): Promise<PublicProfile> {
    return apiClient<PublicProfile>(`/profiles/${idOrSlug}`);
  },

  // Fetch current user's profile (owner DTO)
  async fetchOwnerProfile(): Promise<OwnerProfile | null> {
    return apiClient<OwnerProfile | null>('/profiles/me');
  },

  // Create new profile
  async createProfile(data: Partial<PublicProfile>): Promise<OwnerProfile> {
    return apiClient<OwnerProfile>('/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update current owner profile (idempotent)
  async updateOwnerProfile(data: Partial<PublicProfile>): Promise<OwnerProfile> {
    return apiClient<OwnerProfile>('/profiles/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Add credential
  async addCredential(credential: ProfileCredential): Promise<ProfileCredential> {
    return apiClient<ProfileCredential>('/profiles/me/credentials', {
      method: 'POST',
      body: JSON.stringify(credential),
    });
  },

  // Remove credential
  async removeCredential(credentialId: string): Promise<boolean> {
    const res = await apiClient<{ removed: boolean }>(`/profiles/me/credentials/${credentialId}`, {
      method: 'DELETE',
    });
    return res.removed;
  },

  // Add operational unit / location
  async addLocation(location: ProfileLocation): Promise<ProfileLocation> {
    return apiClient<ProfileLocation>('/profiles/me/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  },

  // Remove operational unit / location
  async removeLocation(locationId: string): Promise<boolean> {
    const res = await apiClient<{ removed: boolean }>(`/profiles/me/locations/${locationId}`, {
      method: 'DELETE',
    });
    return res.removed;
  },

  // Rate profile with meaningful interaction
  async rateProfile(
    profileId: string,
    score: number,
    interactionType: 'deal' | 'collaboration' | 'inquiry' | 'service_order',
    privateRationale?: string
  ): Promise<{ rating: number; ratingsCount: number }> {
    return apiClient<{ rating: number; ratingsCount: number }>(`/profiles/${profileId}/ratings`, {
      method: 'POST',
      body: JSON.stringify({ score, interactionType, privateRationale }),
    });
  },

  // Record interaction event (observability)
  async recordEvent(profileId: string, eventType: string, metadata?: any): Promise<void> {
    await apiClient<{ recorded: boolean }>(`/profiles/${profileId}/events`, {
      method: 'POST',
      body: JSON.stringify({ eventType, metadata }),
    }).catch(() => {
      // Non-blocking telemetry
    });
  },
};
