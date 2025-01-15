import { z } from 'zod'

export const createUserSchema = z.object({
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  password: z.string(),
  password_confirmation: z.string(),
  birthdate: z.string(),
  street_address: z.string(),
  unit_number: z.string().nullable(),
  city: z.string(),
  region: z.string(),
  zip_code: z.string(),
  role: z.enum(['CUSTOMER', 'ADMIN']).default('CUSTOMER'),
  raw_pin: z.string(),
})

export type CreateUserSchema = z.infer<typeof createUserSchema>

export const createUserSchemaWithExtraFields = createUserSchema
  .omit({ password_confirmation: true, raw_pin: true })
  .extend({
    hashed_pin: z.string(),
    created_at: z.date(),
    updated_at: z.date(),
  })

export type CreateUserSchemaWithExtraFields = z.infer<typeof createUserSchemaWithExtraFields>

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})
export type LoginUserSchema = z.infer<typeof loginUserSchema>

export const updateProfileBodySchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  street_address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  zip_code: z.string().optional(),
  unit_number: z.string().optional(),
})

export type UpdateProfileRequest = z.infer<typeof updateProfileBodySchema>

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().default(''),
  sort: z.enum(['id', 'first_name', 'last_name', 'username', 'email']).default('id'),
  order: z.enum(['asc', 'desc']).default('asc'),
})

export type ListUsersQuerySchema = z.infer<typeof listUsersQuerySchema>
