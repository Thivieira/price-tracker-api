import { FastifyReply, FastifyRequest } from 'fastify'
import { updateProfileBodySchema } from '@/schemas/user.schema'
import { makeUpdateUserProfileUseCase, makeFindUserUseCase } from '@/factories/user.factory'
import { ZodError } from 'zod'
import { json } from '@/lib/json'
import { genericErrorSchema, successResponseSchema } from '@/schemas/route-schemas'
import { errorResponses, successResponse } from '@/schemas/swagger-schemas'

export const updateProfileOpts = {
  schema: {
    tags: ['users'],
    description: 'Update user profile information',
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      properties: {
        first_name: { type: 'string', minLength: 2 },
        last_name: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string', minLength: 10 },
        street_address: { type: 'string', minLength: 5 },
        city: { type: 'string', minLength: 2 },
        region: { type: 'string', minLength: 2 },
        zip_code: { type: 'string', minLength: 5 },
        unit_number: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                path: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          }
        }
      },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string' }
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

export default async function updateProfile(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const validation = updateProfileBodySchema.safeParse(request.body)

    if (!validation.success) {
      return reply.status(400).send(
        json({
          success: false,
          message: 'Validation error.',
          errors: validation.error.errors,
        }),
      )
    }

    const validatedData = validation.data

    const user = await makeFindUserUseCase().byId(Number(request.user.sub))

    if (!user) {
      return reply.status(404).send(
        json({
          success: false,
          message: 'User not found',
        }),
      )
    }

    // Check if email already exists for another user
    if (validatedData.email) {
      const existingUser = await makeFindUserUseCase().byEmail(validatedData.email)
      if (existingUser && existingUser.id !== user.id) {
        return reply.status(400).send(
          json({
            success: false,
            message: 'Email already in use',
          }),
        )
      }
    }

    //check if phone already exists for another user
    if (validatedData.phone) {
      const existingUser = await makeFindUserUseCase().byPhone(validatedData.phone)
      if (existingUser && existingUser.id !== user.id) {
        return reply.status(400).send(
          json({
            success: false,
            message: 'Phone already in use',
          }),
        )
      }
    }

    await makeUpdateUserProfileUseCase().execute(Number(user.id), validatedData)

    return reply.status(200).send(
      json({
        success: true,
        message: 'Profile updated successfully',
      }),
    )
  } catch (error) {
    console.error(error)

    if (error instanceof ZodError) {
      return reply.status(400).send(
        json({
          success: false,
          message: 'Validation error.',
          errors: error.errors,
        }),
      )
    }

    return reply.status(500).send(
      json({
        success: false,
        message: 'Failed to update profile',
      }),
    )
  }
}
