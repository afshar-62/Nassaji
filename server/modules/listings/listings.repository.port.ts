export type ListingStatus = 'draft' | 'published' | 'archived' | 'suspended';

export interface ListingEntity {
  id: string;
  businessId: string;
  createdById: string;
  categoryId?: string | null;
  categorySlug: string;
  title: string;
  description: string;
  activityType: 'offer' | 'need' | 'capacity';
  commodityType?: string | null;
  priceType: 'fixed' | 'negotiable' | 'per_unit';
  priceAmount?: string | null;
  unit?: string | null;
  minimumOrder?: string | null;
  city: string;
  province: string;
  status: ListingStatus;
  viewsCount: number;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateListingDTO {
  businessId: string;
  createdById: string;
  categorySlug: string;
  title: string;
  description: string;
  activityType?: 'offer' | 'need' | 'capacity';
  commodityType?: string;
  priceType?: 'fixed' | 'negotiable' | 'per_unit';
  priceAmount?: number;
  unit?: string;
  minimumOrder?: string;
  city: string;
  province?: string;
  status?: ListingStatus;
  mediaUrls?: string[];
  location?: {
    title: string;
    city: string;
    province: string;
    latitude?: number;
    longitude?: number;
    addressDetails?: string;
  };
}

export interface UpdateListingDraftDTO {
  title?: string;
  description?: string;
  activityType?: 'offer' | 'need' | 'capacity';
  commodityType?: string;
  priceType?: 'fixed' | 'negotiable' | 'per_unit';
  priceAmount?: number;
  unit?: string;
  minimumOrder?: string;
  city?: string;
  province?: string;
  mediaUrls?: string[];
  location?: {
    title: string;
    city: string;
    province: string;
    latitude?: number;
    longitude?: number;
    addressDetails?: string;
  };
}

export interface IListingRepository {
  createDraft(dto: CreateListingDTO): Promise<ListingEntity>;
  updateDraft(id: string, businessId: string, dto: UpdateListingDraftDTO): Promise<ListingEntity | null>;
  publishListing(id: string, businessId: string): Promise<ListingEntity | null>;
  archiveListing(id: string, businessId: string): Promise<ListingEntity | null>;
  suspendListing(id: string, businessId: string): Promise<ListingEntity | null>;
  attachMedia(listingId: string, businessId: string, url: string, uploadedById: string, isCover?: boolean): Promise<any>;
  detachMedia(listingId: string, businessId: string, mediaIdOrUrl: string): Promise<boolean>;
  attachLocation(listingId: string, businessId: string, locationData: { title?: string; city: string; province: string; latitude?: number; longitude?: number; addressDetails?: string }): Promise<any>;
  detachLocation(listingId: string, businessId: string): Promise<boolean>;
  findById(id: string): Promise<{ listing: ListingEntity; media: string[]; location?: any; business: any } | null>;
  findFeed(filters: { categorySlug?: string; city?: string; limit?: number; offset?: number }): Promise<any[]>;
}
