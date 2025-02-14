import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcrypt'
import { createUserSchema } from '@/schemas/user.schema'
import { makeCreateUserUseCase, makeFindUserUseCase, makeLoginUseCase } from '@/factories/user.factory'

export default async function register(request: FastifyRequest, reply: FastifyReply) {
  console.log(request.body)

  const validatedData = createUserSchema.parse(request.body)

  console.log('passed')

  const existingUsername = await makeFindUserUseCase().byUsername(validatedData.username)

  if (existingUsername) {
    return reply.status(400).send({ error: 'Username already in use' })
  }

  const existingPhone = await makeFindUserUseCase().byPhone(validatedData.phone)

  if (existingPhone) {
    return reply.status(400).send({ error: 'Phone number already in use' })
  }

  if (validatedData.password !== validatedData.password_confirmation) {
    return reply.status(400).send({ error: 'Passwords do not match' })
  }

  const hashedPassword = await bcrypt.hash(validatedData.password, 10)
  const hashedPin = await bcrypt.hash(validatedData.raw_pin, 10)

  const user = await makeCreateUserUseCase().execute({
    username: validatedData.username,
    password: hashedPassword,
    first_name: validatedData.first_name,
    last_name: validatedData.last_name,
    phone: validatedData.phone,
    birthdate: validatedData.birthdate,
    street_address: validatedData.street_address,
    unit_number: validatedData.unit_number,
    city: validatedData.city,
    region: validatedData.region,
    zip_code: validatedData.zip_code,
    role: 'CUSTOMER',
    hashed_pin: hashedPin
  })


  const login = await makeLoginUseCase().execute(Number(user.id))

  return reply.status(201).send({
    message: 'User registered successfully',
    accessToken: login.accessToken,
    refreshToken: login.refreshToken,
  })
}

export const registerOpts = {
  schema: {
    tags: ['auth'],
    description: 'Register a new user',
    body: {
      type: 'object',
      required: [
        'username',
        'first_name',
        'last_name',
        'phone',
        'password',
        'password_confirmation',
        'birthdate',
        'street_address',
        'city',
        'region',
        'zip_code'
      ],
      properties: {
        username: { type: 'string', description: 'Unique username' },
        first_name: { type: 'string', minLength: 2 },
        last_name: { type: 'string', minLength: 2 },
        phone: { type: 'string', description: 'Phone number with country code' },
        password: {
          type: 'string',
          format: 'password',
          description: 'Must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          minLength: 8,
          maxLength: 100
        },
        password_confirmation: {
          type: 'string',
          description: 'Must match password field'
        },
        birthdate: { type: 'string' },
        street_address: { type: 'string', minLength: 5 },
        unit_number: { type: 'string', nullable: true },
        city: { type: 'string', minLength: 2 },
        region: { type: 'string', minLength: 2 },
        zip_code: { type: 'string', minLength: 5 }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      },
      409: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      },
      500: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    }
  }
}
