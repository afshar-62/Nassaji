export interface ExploreFilterParams {
  categoryId?: string;
  categorySlug?: string;
  province?: string;
  city?: string;
  businessType?: string; // matches activityType ('offer', 'need', 'capacity') or commodityType ('service', 'product', etc.)
  search?: string;
  page?: number;
  limit?: number;
}

export interface ExploreListingItem {
  listing: {
    id: string;
    title: string;
    description: string;
    activityType: string;
    commodityType: string | null;
    priceType: string;
    priceAmount: number | null;
    unit: string | null;
    minimumOrder: string | null;
    city: string;
    province: string;
    status: string;
    viewsCount: number;
    publishedAt: Date | null;
    createdAt: Date;
  };
  business: {
    id: string;
    name: string;
    slug: string;
    phone: string | null;
    city: string;
    province: string;
    address: string | null;
    isVerified: boolean;
    rating: number;
    reviewsCount: number;
    avatarUrl: string | null;
    coverUrl: string | null;
    workshopAreaSqm: number | null;
    activeMachinesCount: number | null;
    personnelCount: number | null;
  };
  category: {
    id: string;
    slug: string;
    titleFa: string;
    titleEn: string | null;
    icon: string | null;
  } | null;
  location: {
    id: string;
    title: string;
    province: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
    addressDetails: string | null;
  } | null;
  media: Array<{
    id: string;
    url: string;
    isCover: boolean;
    displayOrder: number;
  }>;
}

export interface ExploreSearchResult {
  items: ExploreListingItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExploreRepositoryPort {
  search(filters: ExploreFilterParams): Promise<ExploreSearchResult>;
}
