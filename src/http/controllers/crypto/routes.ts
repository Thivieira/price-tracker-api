import { FastifyInstance } from 'fastify'

export async function cryptoRoutes(app: FastifyInstance) {
  app.get('/crypto/coin/list', getCryptoPrice)
}
