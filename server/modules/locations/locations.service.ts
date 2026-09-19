import {
  LocationsRepositoryPort,
  BusinessLocationItem,
} from './locations.repository.port.ts';
import { locationsRepository } from './locations.repository.postgres.ts';

export class LocationsService {
  constructor(private readonly repo: LocationsRepositoryPort = locationsRepository) {}

  async getBusinessLocations(): Promise<BusinessLocationItem[]> {
    return this.repo.getBusinessLocations();
  }
}

export const locationsService = new LocationsService();
