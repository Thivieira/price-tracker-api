import { z } from 'zod'

export interface PaginationParams {
  page?: string | number;
  limit?: string | number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}

export const createPaginationSchema = <T extends z.ZodEnum<any>>(
  sortFields: T,
  defaultSort: z.infer<T>
) => {
  return z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    sort: sortFields.default(defaultSort),
    order: z.enum(['asc', 'desc']).default('desc')
  }).passthrough()
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export const getPaginationArgs = (params: PaginationParams) => {
  const page = Number(params.page)
  const limit = Number(params.limit)
  const skip = (page - 1) * limit
  const take = limit
  return { skip, take }
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> {
  return {
    data,
    meta: {
      total,
      page: Number(params.page),
      limit: Number(params.limit),
      pages: Math.ceil(total / Number(params.limit))
    }
  }
} 