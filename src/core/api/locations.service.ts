import { apiClient } from './client.ts';

export interface BusinessLocationDto {
  businessId: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  province: string;
  address?: string | null;
  isVerified: boolean;
}

export const locationsService = {
  async fetchBusinessLocations(): Promise<BusinessLocationDto[]> {
    const res = await apiClient<{ businesses: BusinessLocationDto[]; total: number }>(
      '/locations/businesses'
    );
    return res.businesses || [];
  },
};
