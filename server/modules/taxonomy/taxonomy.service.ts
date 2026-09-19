import {
  TaxonomyRepositoryPort,
  CategoryRecord,
  CategoryTreeNode,
  CategoryFilterOptions,
} from './taxonomy.repository.port.ts';
import { taxonomyRepository } from './taxonomy.repository.postgres.ts';
import { TEXTILE_TAXONOMY_SEEDS } from './taxonomy.seeds.ts';

export class TaxonomyService {
  constructor(private readonly repo: TaxonomyRepositoryPort = taxonomyRepository) {}

  async getCategories(options?: CategoryFilterOptions): Promise<CategoryRecord[]> {
    await this.ensureSeeded();
    return this.repo.findAll(options);
  }

  async getCategoryTree(onlyActive: boolean = true): Promise<CategoryTreeNode[]> {
    await this.ensureSeeded();
    return this.repo.getTree(onlyActive);
  }

  async getCategoryBySlug(slug: string): Promise<CategoryRecord> {
    await this.ensureSeeded();
    const category = await this.repo.findBySlug(slug);
    if (!category) {
      const error: any = new Error(`دسته‌بندی با شناسه '${slug}' یافت نشد`);
      error.statusCode = 404;
      error.code = 'CATEGORY_NOT_FOUND';
      throw error;
    }
    return category;
  }

  async ensureSeeded(): Promise<number> {
    const count = await this.repo.count();
    if (count > 0) {
      return count;
    }

    let totalCreated = 0;

    for (const root of TEXTILE_TAXONOMY_SEEDS) {
      // Create root category
      let rootRecord = await this.repo.findBySlug(root.slug);
      if (!rootRecord) {
        await this.repo.seedCategories([
          {
            parentId: null,
            slug: root.slug,
            titleFa: root.titleFa,
            titleEn: root.titleEn,
            icon: root.icon || null,
            description: root.description || null,
            displayOrder: root.displayOrder,
            isActive: true,
          },
        ]);
        rootRecord = await this.repo.findBySlug(root.slug);
        totalCreated++;
      }

      if (rootRecord && root.children) {
        for (const child of root.children) {
          const childRecord = await this.repo.findBySlug(child.slug);
          if (!childRecord) {
            await this.repo.seedCategories([
              {
                parentId: rootRecord.id,
                slug: child.slug,
                titleFa: child.titleFa,
                titleEn: child.titleEn,
                icon: child.icon || null,
                description: child.description || null,
                displayOrder: child.displayOrder,
                isActive: true,
              },
            ]);
            totalCreated++;
          }
        }
      }
    }

    return totalCreated;
  }
}

export const taxonomyService = new TaxonomyService();
