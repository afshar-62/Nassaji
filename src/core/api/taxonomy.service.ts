import { apiClient } from './client.ts';

export interface CategoryDto {
  id: string;
  parentId: string | null;
  slug: string;
  titleFa: string;
  titleEn: string | null;
  icon: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CategoryTreeDto extends CategoryDto {
  children: CategoryTreeDto[];
}

export const taxonomyService = {
  async fetchCategories(params?: { parentId?: string | null; active?: boolean }): Promise<CategoryDto[]> {
    const query = new URLSearchParams();
    if (params?.parentId !== undefined) {
      query.set('parentId', params.parentId === null ? 'null' : params.parentId);
    }
    if (params?.active !== undefined) {
      query.set('active', String(params.active));
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient<{ categories: CategoryDto[]; total: number }>(`/categories${queryString}`);
    return res.categories || [];
  },

  async fetchCategoryTree(activeOnly: boolean = true): Promise<CategoryTreeDto[]> {
    const res = await apiClient<{ tree: CategoryTreeDto[]; totalRoots: number }>(
      `/categories/tree?active=${activeOnly}`
    );
    return res.tree || [];
  },

  async fetchCategoryBySlug(slug: string): Promise<CategoryDto> {
    return apiClient<CategoryDto>(`/categories/${slug}`);
  },
};
