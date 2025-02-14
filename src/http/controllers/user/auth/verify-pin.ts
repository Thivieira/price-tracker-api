import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { InvalidCredentialsError } from '@/exceptions/auth.exceptions'
import { makePinUseCase } from '@/factories/pin.factory'

export default async function verifyPin(
  request: FastifyRequest,
  reply: FastifyReply,
) {

  const userId = Number(request.user.sub)

  const verifyPinBodySchema = z.object({
    pin: z.string().min(4).max(4).regex(/^\d+$/),
  })

  const { pin } = verifyPinBodySchema.parse(request.body)

  try {
    await makePinUseCase().verify(userId, pin)
    return reply.status(200).send({
      message: 'PIN verified successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        issues: error.format(),
      })
    }

    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({
        message: error.message,
      })
    }

    throw error
  }
}

export const verifyPinOpts = {
  schema: {
    tags: ['auth'],
    description: 'Verify user PIN',
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      required: ['pin'],
      properties: {
        pin: {
          type: 'string',
          minLength: 4,
          maxLength: 4,
          pattern: '^[0-9]+$',
          description: '4-digit PIN'
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          issues: {
            type: 'object',
            additionalProperties: true
          }
        }
      },
      401: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      500: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    }
  }
}
