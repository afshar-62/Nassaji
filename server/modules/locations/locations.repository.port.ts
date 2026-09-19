export interface BusinessLocationItem {
  businessId: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  province: string;
  address?: string | null;
  isVerified: boolean;
}

export interface LocationsRepositoryPort {
  getBusinessLocations(): Promise<BusinessLocationItem[]>;
}
