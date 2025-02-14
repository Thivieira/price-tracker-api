import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateUserProfileUseCase, makeFindUserUseCase } from '@/factories/user.factory'
import bcrypt from 'bcrypt'
import { json } from '@/lib/json'
import { UpdateProfileRequest } from '@/schemas/user.schema'


export default async function updatePassword(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const updatePasswordBodySchema = z.object({
      current_password: z.string().min(6),
      new_password: z.string().min(6),
      confirm_new_password: z.string().min(6),
    }).refine((data) => data.new_password === data.confirm_new_password, {
      message: "Passwords don't match",
      path: ["confirm_new_password"],
    })

    const { current_password, new_password } = updatePasswordBodySchema.parse(
      request.body as UpdateProfileRequest
    )

    const user = await makeFindUserUseCase().byId(Number(request.user.sub))

    if (!user) {
      throw new Error('User not found')
    }

    const validCurrentPassword = await bcrypt.compare(current_password, user.password)

    if (!validCurrentPassword) {
      throw new Error('Current password is incorrect')
    }

    await makeUpdateUserProfileUseCase().updatePassword(Number(user.id), new_password)

    reply.status(200).send(
      json({
        success: true,
        message: 'Password updated successfully',
      }),
    )
  } catch (error) {
    console.log(error)
    reply.status(500).send(
      json({
        success: false,
        message: 'Failed to update password',
      }),
    )
  }
}

export const updatePasswordOpts = {
  schema: {
    tags: ['users'],
    description: 'Update user password',
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      required: ['current_password', 'new_password', 'confirm_new_password'],
      properties: {
        current_password: {
          type: 'string',
          minLength: 6,
          description: 'Current password'
        },
        new_password: {
          type: 'string',
          minLength: 6,
          description: 'New password'
        },
        confirm_new_password: {
          type: 'string',
          minLength: 6,
          description: 'Confirm new password'
        }
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
