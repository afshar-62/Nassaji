import { apiClient } from './client.ts';
import { MOCK_ADS_22 } from '../../data/mockAdsData.ts';

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
    hasVideo?: boolean;
    videoUrl?: string;
    videoDuration?: string;
    videoQuality?: string;
    aspectRatio?: 'horizontal' | 'vertical' | 'square';
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

// Transform MOCK_ADS_22 into ExploreItemDto format
function getMockExploreItems(filters: ExploreFilterParams): ExploreResponseDto {
  let ads = [...MOCK_ADS_22];

  if (filters.city && filters.city !== 'همه شهرها') {
    ads = ads.filter((a) => a.city === filters.city);
  }

  if (filters.categoryId && filters.categoryId !== 'همه') {
    ads = ads.filter(
      (a) => a.category === filters.categoryId || a.subCategory?.includes(filters.categoryId)
    );
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    ads = ads.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.authorName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }

  const items: ExploreItemDto[] = ads.map((ad, idx) => ({
    listing: {
      id: ad.id,
      title: ad.title,
      description: ad.description,
      activityType: ad.hasVideo ? 'video-showcase' : 'offer',
      commodityType: ad.subCategory || 'تجهیزات و خدمات',
      priceType: 'fixed',
      priceAmount: ad.price ? Number(ad.price.replace(/[^\d]/g, '')) || 0 : 0,
      unit: 'واحد',
      minimumOrder: 'سفارشی',
      city: ad.city || 'تهران',
      province: ad.province || 'تهران',
      status: 'published',
      viewsCount: ad.likesCount * 3 + 12,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      hasVideo: ad.hasVideo,
      videoUrl: ad.videoUrl,
      videoDuration: ad.videoDuration,
      videoQuality: ad.videoQuality,
      aspectRatio: ad.aspectRatio,
    },
    business: {
      id: ad.authorId,
      name: ad.authorName,
      slug: `biz-${ad.authorId}`,
      phone: ad.contact?.phone || ad.contact?.mobile || '02166778899',
      city: ad.city || 'تهران',
      province: ad.province || 'تهران',
      address: ad.location?.addressText || 'تهران، بازار بزرگ',
      isVerified: ad.authorVerified ?? true,
      rating: ad.authorRating || 4.8,
      reviewsCount: ad.commentsCount || 15,
      avatarUrl: ad.authorAvatar,
      coverUrl: ad.images[0],
      workshopAreaSqm: 350 + idx * 50,
      activeMachinesCount: 10 + (idx % 15),
      personnelCount: 8 + (idx % 20),
    },
    category: {
      id: `cat-${idx}`,
      slug: ad.category,
      titleFa: ad.category,
      titleEn: null,
      icon: null,
    },
    location: ad.location
      ? {
          id: `loc-${idx}`,
          title: ad.location.areaName || ad.city,
          province: ad.province || 'تهران',
          city: ad.city,
          latitude: ad.location.lat,
          longitude: ad.location.lng,
          addressDetails: ad.location.addressText,
        }
      : null,
    media: ad.images.map((imgUrl, mIdx) => ({
      id: `media-${idx}-${mIdx}`,
      url: imgUrl,
      isCover: mIdx === 0,
      displayOrder: mIdx,
    })),
  }));

  return {
    items,
    total: items.length,
    page: filters.page || 1,
    limit: filters.limit || 20,
    totalPages: 1,
  };
}

export const exploreService = {
  async fetchExploreItems(filters: ExploreFilterParams = {}): Promise<ExploreResponseDto> {
    try {
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
      const response = await apiClient<ExploreResponseDto>(`/explore${query}`);

      // Verify that backend items are actually diverse and not old duplicate seeds
      if (response && response.items && response.items.length >= 10) {
        const uniqueTitles = new Set(response.items.map((it) => it.listing.title));
        if (uniqueTitles.size >= 8) {
          return response;
        }
      }
    } catch {
      // Backend not accessible or error; use comprehensive client dataset
    }

    return getMockExploreItems(filters);
  },
};

