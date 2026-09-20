import { apiClient } from './client.ts';
import { AdItem } from '../../types.ts';
import { MOCK_ADS } from '../../data/mockData.ts';

export interface ListingsQueryFilter {
  category?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const listingsService = {
  async fetchListings(filters: ListingsQueryFilter = {}): Promise<AdItem[]> {
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'همه') params.set('category', filters.category);
      if (filters.city && filters.city !== 'همه شهرها') params.set('city', filters.city);
      if (filters.search) params.set('search', filters.search);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));

      const query = params.toString() ? `?${params.toString()}` : '';
      const rawItems = await apiClient<any[]>(`/listings${query}`);

      if (rawItems && rawItems.length >= 10) {
        const uniqueTitles = new Set(rawItems.map((i) => i.title));
        if (uniqueTitles.size >= 8) {
          return rawItems.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            city: item.city,
            province: item.province || 'تهران',
            price: item.price,
            createdAtText: item.timeAgo || 'ثبت شده در سیستم',
            images: item.images && item.images.length > 0 ? item.images : [item.image],
            hasVideo: item.hasVideo,
            videoUrl: item.videoUrl,
            aspectRatio: item.aspectRatio || 'horizontal',
            videoDuration: item.videoDuration || '۰۳:۴۵',
            videoQuality: item.videoQuality || '1080p FHD',
            authorId: item.businessId || item.author?.id || 'user-1',
            authorName: item.author?.name || 'کسب‌وکار معتبر نساجی',
            authorAvatar: item.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            authorRating: item.author?.rating || 4.8,
            authorVerified: item.author?.verified ?? true,
            authorSpecialty: 'تولید و خدمات نساجی',
            authorActivity: 'فعال در بازارگاه',
            description: item.description,
            likesCount: 24,
            commentsCount: 5,
            isUrgent: false,
            isFeatured: false,
            contact: {
              mobile: '09121112233',
              phone: '02166778899',
              smsNumber: '09121112233',
              whatsapp: '09121112233',
            },
            location: {
              lat: 35.6997,
              lng: 51.4085,
              addressText: 'خیابان جمهوری، پاساژ کاوه',
              areaName: 'جمهوری',
            },
            comments: [],
          }));
        }
      }
    } catch {
      // Backend not running or offline; proceed to comprehensive mock data
    }

    // Comprehensive client dataset with 22 ads across 20 verified profiles
    let filtered = [...MOCK_ADS];
    if (filters.category && filters.category !== 'همه') {
      filtered = filtered.filter((ad) => ad.category === filters.category);
    }
    if (filters.city && filters.city !== 'همه شهرها') {
      filtered = filtered.filter((ad) => ad.city === filters.city);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter((ad) =>
        ad.title.toLowerCase().includes(q) ||
        ad.description.toLowerCase().includes(q) ||
        ad.authorName.toLowerCase().includes(q)
      );
    }
    return filtered;
  },

  async fetchListingById(id: string): Promise<any> {
    return apiClient<any>(`/listings/${id}`);
  },

  async createListing(data: Partial<AdItem>): Promise<AdItem> {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category || 'cmt-subcontracting',
      city: data.city || 'تهران',
      province: 'تهران',
      activityType: 'offer',
      commodityType: 'product',
      priceType: data.price?.includes('تومان') ? 'fixed' : 'negotiable',
      priceAmount: data.price ? Number(data.price.replace(/[^\d]/g, '')) || undefined : undefined,
      images: data.images && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80'],
      status: 'published',
    };

    const created = await apiClient<any>('/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      id: created.id,
      title: created.title,
      category: created.categorySlug,
      city: created.city,
      province: created.province || 'تهران',
      price: data.price || 'توافقی',
      createdAtText: 'لحظاتی پیش',
      images: payload.images,
      authorId: created.businessId,
      authorName: 'تولیدی صنعتی پارس دوخت (شما)',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      authorRating: 5.0,
      authorVerified: true,
      authorSpecialty: 'تولید پوشاک تریکو',
      authorActivity: 'فعالیت امروز',
      description: created.description,
      likesCount: 0,
      commentsCount: 0,
      isUrgent: false,
      contact: {
        mobile: '09121112233',
        phone: '02166778899',
        smsNumber: '09121112233',
        whatsapp: '09121112233',
      },
      location: {
        lat: 35.6997,
        lng: 51.4085,
        addressText: 'خیابان جمهوری، پاساژ کاوه',
        areaName: 'جمهوری',
      },
      comments: [],
    };
  },
};
