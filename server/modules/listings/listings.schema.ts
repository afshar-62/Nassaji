import { z } from 'zod';

export const CreateListingSchema = z.object({
  title: z.string().min(3, 'عنوان آگهی حداقل ۳ کاراکتر است').max(100, 'عنوان حداکثر ۱۰۰ کاراکتر است'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),
  category: z.string().min(2, 'دسته‌بندی نامعتبر است'),
  city: z.string().min(2, 'شهر نامعتبر است'),
  province: z.string().optional().default('تهران'),
  activityType: z.enum(['offer', 'need', 'capacity']).optional().default('offer'),
  commodityType: z.string().optional().default('product'),
  priceType: z.enum(['fixed', 'negotiable', 'per_unit']).optional().default('negotiable'),
  priceAmount: z.number().optional(),
  unit: z.string().optional().default('تکه'),
  minimumOrder: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  location: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    areaName: z.string().optional(),
    addressText: z.string().optional(),
  }).optional(),
});

export const UpdateDraftSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  activityType: z.enum(['offer', 'need', 'capacity']).optional(),
  commodityType: z.string().optional(),
  priceType: z.enum(['fixed', 'negotiable', 'per_unit']).optional(),
  priceAmount: z.number().optional(),
  unit: z.string().optional(),
  minimumOrder: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  images: z.array(z.string()).optional(),
  location: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    areaName: z.string().optional(),
    addressText: z.string().optional(),
  }).optional(),
});

export const QueryListingsSchema = z.object({
  category: z.string().optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  page: z.preprocess((val) => Number(val) || 1, z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => Number(val) || 20, z.number().int().min(1).max(50).default(20)),
});

export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type UpdateDraftInput = z.infer<typeof UpdateDraftSchema>;
export type QueryListingsInput = z.infer<typeof QueryListingsSchema>;
