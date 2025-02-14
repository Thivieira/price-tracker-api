import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetProfileUseCase } from '@/factories/user.factory'
import { hasValidAuthSubject } from '@/utils/valid-subject';

export const getProfileOpts = {
  schema: {
    tags: ['users'],
    description: 'Get current user profile',
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              username: { type: 'string' },
              email: { type: 'string' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              phone: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
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
      400: {
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

export default async function getProfile(request: FastifyRequest, reply: FastifyReply) {
  try {

    const userId = hasValidAuthSubject(request) ? (request.user as { sub: string }).sub : null;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const getProfileUseCase = makeGetProfileUseCase();
    const { user } = await getProfileUseCase.execute({ userId: Number(userId) });

    return reply.status(200).send({
      user,
    })
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send({ message: error.message })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}
