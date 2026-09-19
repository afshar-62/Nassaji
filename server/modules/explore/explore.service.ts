import {
  ExploreRepositoryPort,
  ExploreFilterParams,
  ExploreSearchResult,
} from './explore.repository.port.ts';
import { exploreRepository } from './explore.repository.postgres.ts';
import { taxonomyService } from '../taxonomy/taxonomy.service.ts';

export class ExploreService {
  constructor(private readonly repo: ExploreRepositoryPort = exploreRepository) {}

  async explore(filters: ExploreFilterParams): Promise<ExploreSearchResult> {
    // Ensure taxonomy seeds are loaded so taxonomy filters match
    await taxonomyService.ensureSeeded();
    return this.repo.search(filters);
  }
}

export const exploreService = new ExploreService();
