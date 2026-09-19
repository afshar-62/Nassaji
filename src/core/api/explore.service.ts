import { apiClient } from './client.ts';

export interface ExploreFilterParams {
  categoryId?: string;
  categorySlug?: string;
  province?: string;
  city?: string;
  businessType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ExploreItemDto {
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
    publishedAt: string | null;
    createdAt: string;
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

export interface ExploreResponseDto {
  items: ExploreItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const exploreService = {
  async fetchExploreItems(filters: ExploreFilterParams = {}): Promise<ExploreResponseDto> {
    const params = new URLSearchParams();
    if (filters.categoryId && filters.categoryId !== 'همه') params.set('categoryId', filters.categoryId);
    if (filters.categorySlug && filters.categorySlug !== 'همه') params.set('categorySlug', filters.categorySlug);
    if (filters.province && filters.province !== 'همه استان‌ها') params.set('province', filters.province);
    if (filters.city && filters.city !== 'همه شهرها') params.set('city', filters.city);
    if (filters.businessType && filters.businessType !== 'all') params.set('businessType', filters.businessType);
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient<ExploreResponseDto>(`/explore${query}`);
  },
};
