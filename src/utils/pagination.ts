import { z } from 'zod'

export const createPaginationSchema = <T extends z.ZodEnum<any>>(
  sortFields: T,
  defaultSort: z.infer<T>
) => {
  return z.object({
    page: z.string().default('1'),
    limit: z.string().default('10'),
    search: z.string().optional(),
    sort: sortFields.default(defaultSort),
    order: z.enum(['asc', 'desc']).default('desc')
  })
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

export interface PaginationParams {
  page: string
  limit: string
  search?: string
  sort: string
  order: 'asc' | 'desc'
}

export function getPaginationArgs(params: PaginationParams) {
  const skip = (Number(params.page) - 1) * Number(params.limit)
  const take = Number(params.limit)

  return {
    skip,
    take
  }
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