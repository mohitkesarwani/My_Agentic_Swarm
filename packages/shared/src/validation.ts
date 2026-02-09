import { z } from 'zod';

/** Pagination query schema */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** ID parameter schema */
export const idParamSchema = z.object({
  id: z.string().min(1),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
