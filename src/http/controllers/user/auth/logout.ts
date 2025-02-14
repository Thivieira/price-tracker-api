import { FastifyRequest, FastifyReply } from 'fastify'
import { makeRefreshTokenRepository } from '@/factories/refresh-token.factory'
import { TokenCleanupService } from '@/services/token-cleanup.service'
import { hasValidAuthSubject } from '@/utils/valid-subject';

export const logoutOpts = {
  schema: {
    tags: ['auth'],
    description: 'Logout user',
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
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

export default async function logout(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = hasValidAuthSubject(request) ? (request.user as { sub: string }).sub : null;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const tokenCleanupService = new TokenCleanupService(makeRefreshTokenRepository())

    await tokenCleanupService.cleanupUserTokens(Number(userId))

    return reply.status(200).send({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return reply.status(500).send({ error: 'Failed to logout' })
  }
}
