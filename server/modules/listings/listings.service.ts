import { IListingRepository, CreateListingDTO, UpdateListingDraftDTO } from './listings.repository.port.ts';
import { listingRepository } from './listings.repository.postgres.ts';

export class ListingService {
  constructor(private repo: IListingRepository = listingRepository) {}

  async createDraft(dto: CreateListingDTO) {
    if (!dto.businessId) {
      throw new Error('BUSINESS_REQUIRED: Listing must be owned by an active business entity.');
    }
    if (!dto.createdById) {
      throw new Error('CREATOR_REQUIRED: Listing creator user ID must be recorded.');
    }
    return this.repo.createDraft(dto);
  }

  async updateDraft(id: string, businessId: string, dto: UpdateListingDraftDTO) {
    return this.repo.updateDraft(id, businessId, dto);
  }

  async publish(id: string, businessId: string) {
    return this.repo.publishListing(id, businessId);
  }

  async archive(id: string, businessId: string) {
    return this.repo.archiveListing(id, businessId);
  }

  async suspend(id: string, businessId: string) {
    return this.repo.suspendListing(id, businessId);
  }

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async attachMedia(listingId: string, businessId: string, url: string, uploadedById: string, isCover: boolean = false) {
    return this.repo.attachMedia(listingId, businessId, url, uploadedById, isCover);
  }

  async detachMedia(listingId: string, businessId: string, mediaIdOrUrl: string) {
    return this.repo.detachMedia(listingId, businessId, mediaIdOrUrl);
  }

  async attachLocation(
    listingId: string,
    businessId: string,
    locationData: { title?: string; city: string; province: string; latitude?: number; longitude?: number; addressDetails?: string }
  ) {
    return this.repo.attachLocation(listingId, businessId, locationData);
  }

  async detachLocation(listingId: string, businessId: string) {
    return this.repo.detachLocation(listingId, businessId);
  }

  async getFeed(filters: { categorySlug?: string; city?: string; limit?: number; offset?: number }) {
    return this.repo.findFeed(filters);
  }
}

export const listingService = new ListingService();
