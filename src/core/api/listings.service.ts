import { apiClient } from './client.ts';
import { AdItem } from '../../types.ts';

export interface ListingsQueryFilter {
  category?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const listingsService = {
  async fetchListings(filters: ListingsQueryFilter = {}): Promise<AdItem[]> {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'همه') params.set('category', filters.category);
    if (filters.city && filters.city !== 'همه شهرها') params.set('city', filters.city);
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const query = params.toString() ? `?${params.toString()}` : '';
    const rawItems = await apiClient<any[]>(`/listings${query}`);

    return (rawItems || []).map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      city: item.city,
      province: item.province || 'تهران',
      price: item.price,
      createdAtText: item.timeAgo || 'ثبت شده در سیستم',
      images: item.images && item.images.length > 0 ? item.images : [item.image],
      authorId: item.businessId || item.author?.id || 'biz-1',
      authorName: item.author?.name || 'کسب‌وکار معتبر نساجی',
      authorAvatar: item.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      authorRating: item.author?.rating || 5.0,
      authorVerified: item.author?.verified ?? true,
      authorSpecialty: 'تولید و خدمات نساجی',
      authorActivity: 'فعال در بازارگاه',
      description: item.description,
      likesCount: 12,
      commentsCount: 3,
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
