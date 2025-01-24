import { FastifyRequest } from 'fastify'

export const hasValidAuthSubject = (request: FastifyRequest) => {
  return typeof request.user === 'object' && request.user !== null
}