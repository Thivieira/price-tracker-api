import { FastifyReply, FastifyRequest } from 'fastify'
import { makeRefreshTokenUseCase } from '@/factories/refresh-token.factory'

export default async function refresh(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Get refresh token from Authorization header or request body
    const refreshToken =
      request.headers.authorization?.replace('Bearer ', '') ||
      (request.body as { refreshToken?: string })?.refreshToken

    if (!refreshToken) {
      return reply.status(401).send({ error: 'Refresh token required' })
    }

    const refreshTokenUseCase = makeRefreshTokenUseCase()
    const { accessToken, refreshToken: newRefreshToken } =
      await refreshTokenUseCase.execute(refreshToken)

    // Return both tokens in the response body
    return reply.send({
      accessToken,
      refreshToken: newRefreshToken.token,
    })
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(401).send({ error: error.message })
    }
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

export const refreshOpts = {
  schema: {
    tags: ['auth'],
    description: 'Refresh access token using refresh token',
    body: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'Valid refresh token'
        }
      }
    },
    headers: {
      type: 'object',
      properties: {
        authorization: {
          type: 'string',
          description: 'Bearer refresh_token',
          pattern: '^Bearer '
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' }
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
          error: { type: 'string' }
        }
      }
    }
  }
}
