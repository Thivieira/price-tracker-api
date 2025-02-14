import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcrypt'
import { createUserSchema } from '@/schemas/user.schema'
import { makeCreateUserUseCase, makeFindUserUseCase, makeLoginUseCase } from '@/factories/user.factory'

export default async function register(request: FastifyRequest, reply: FastifyReply) {
  const validatedData = createUserSchema.parse(request.body)

  // const existingEmail = await makeFindUserUseCase().byEmail(validatedData.email)

  // if (existingEmail) {
  //   return reply.status(400).send({ error: 'Email already in use' })
  // }

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
    // email: validatedData.email,
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
    hashed_pin: hashedPin,
    created_at: new Date(),
    updated_at: new Date(),
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
      required: ['username', 'email', 'password', 'phone'],
      properties: {
        username: { type: 'string', description: 'Unique username' },
        email: { type: 'string', format: 'email', description: 'Valid email address' },
        password: { type: 'string', format: 'password', minLength: 8 },
        phone: { type: 'string', description: 'Phone number with country code' }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          errors: { type: 'object' }
        }
      }
    }
  }
}
