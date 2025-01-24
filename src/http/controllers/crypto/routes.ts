import { FastifyInstance } from 'fastify'
import listCoins from './list-coins'
import getCoin from './get-coin'
import syncCoins from './sync-coins'
import convertCurrency from './convert-currency'

export async function cryptoRoutes(app: FastifyInstance) {
  app.get('/coins', { onRequest: [app.authenticate] }, listCoins)
  app.get('/coins/:id', { onRequest: [app.authenticate] }, getCoin)
  app.post('/coins/sync', { onRequest: [app.authenticate] }, syncCoins)
  app.post('/coins/convert', { onRequest: [app.authenticate] }, convertCurrency)
}

