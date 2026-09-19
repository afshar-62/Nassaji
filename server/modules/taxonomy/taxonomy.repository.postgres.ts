import { db } from '../../../src/db/index.ts';
import { categories } from '../../../src/db/schema.ts';
import { eq, isNull, and, asc, sql } from 'drizzle-orm';
import {
  CategoryRecord,
  CategoryTreeNode,
  CategoryFilterOptions,
  TaxonomyRepositoryPort,
} from './taxonomy.repository.port.ts';

export class PostgresTaxonomyRepository implements TaxonomyRepositoryPort {
  async findAll(options?: CategoryFilterOptions): Promise<CategoryRecord[]> {
    const conditions = [];

    if (options?.isActive !== undefined) {
      conditions.push(eq(categories.isActive, options.isActive));
    }

    if (options?.parentId !== undefined) {
      if (options.parentId === null) {
        conditions.push(isNull(categories.parentId));
      } else {
        conditions.push(eq(categories.parentId, options.parentId));
      }
    }

    const query = db
      .select()
      .from(categories)
      .orderBy(asc(categories.displayOrder), asc(categories.titleFa));

    if (conditions.length > 0) {
      return (await query.where(and(...conditions))) as CategoryRecord[];
    }

    return (await query) as CategoryRecord[];
  }

  async findById(id: string): Promise<CategoryRecord | null> {
    const [row] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return (row as CategoryRecord) || null;
  }

  async findBySlug(slug: string): Promise<CategoryRecord | null> {
    const [row] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    return (row as CategoryRecord) || null;
  }

  async getTree(onlyActive: boolean = true): Promise<CategoryTreeNode[]> {
    const conditions = onlyActive ? [eq(categories.isActive, true)] : [];
    const rows = (await db
      .select()
      .from(categories)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(categories.displayOrder), asc(categories.titleFa))) as CategoryRecord[];

    const nodeMap = new Map<string, CategoryTreeNode>();
    const rootNodes: CategoryTreeNode[] = [];

    // Initialize map
    for (const row of rows) {
      nodeMap.set(row.id, {
        ...row,
        children: [],
      });
    }

    // Build hierarchy
    for (const row of rows) {
      const node = nodeMap.get(row.id)!;
      if (row.parentId && nodeMap.has(row.parentId)) {
        const parent = nodeMap.get(row.parentId)!;
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }

    return rootNodes;
  }

  async count(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(categories);
    return Number(result?.count || 0);
  }

  async seedCategories(
    categoriesList: Array<Omit<CategoryRecord, 'id' | 'createdAt'>>
  ): Promise<number> {
    let seededCount = 0;
    for (const item of categoriesList) {
      const existing = await this.findBySlug(item.slug);
      if (!existing) {
        await db.insert(categories).values({
          parentId: item.parentId,
          slug: item.slug,
          titleFa: item.titleFa,
          titleEn: item.titleEn,
          icon: item.icon,
          description: item.description,
          displayOrder: item.displayOrder,
          isActive: item.isActive,
        });
        seededCount++;
      }
    }
    return seededCount;
  }
}

export const taxonomyRepository = new PostgresTaxonomyRepository();
