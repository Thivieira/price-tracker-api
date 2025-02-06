import { z } from 'zod'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must not exceed 100 characters')
  .regex(PASSWORD_REGEX, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')

const baseUserSchema = z.object({
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email().optional(),
  phone: z.string(),
  password: passwordSchema,
  password_confirmation: passwordSchema,
  birthdate: z.string(),
  street_address: z.string(),
  unit_number: z.string().nullable(),
  city: z.string(),
  region: z.string(),
  zip_code: z.string(),
  role: z.enum(['CUSTOMER', 'ADMIN']).default('CUSTOMER'),
  raw_pin: z.string(),
})

export const createUserSchema = baseUserSchema.refine(
  (data) => data.password === data.password_confirmation,
  {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  }
)

export type CreateUserSchema = z.infer<typeof createUserSchema>

export const createUserSchemaWithExtraFields = z.object({
  ...baseUserSchema.omit({
    password_confirmation: true,
    raw_pin: true,
  }).shape,
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
