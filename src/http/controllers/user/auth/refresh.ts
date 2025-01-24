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
