export interface CategoryRecord {
  id: string;
  parentId: string | null;
  slug: string;
  titleFa: string;
  titleEn: string | null;
  icon: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CategoryTreeNode extends CategoryRecord {
  children: CategoryTreeNode[];
}

export interface CategoryFilterOptions {
  parentId?: string | null;
  isActive?: boolean;
  search?: string;
}

export interface TaxonomyRepositoryPort {
  findAll(options?: CategoryFilterOptions): Promise<CategoryRecord[]>;
  findById(id: string): Promise<CategoryRecord | null>;
  findBySlug(slug: string): Promise<CategoryRecord | null>;
  getTree(onlyActive?: boolean): Promise<CategoryTreeNode[]>;
  count(): Promise<number>;
  seedCategories(categoriesList: Array<Omit<CategoryRecord, 'id' | 'createdAt'>>): Promise<number>;
}
