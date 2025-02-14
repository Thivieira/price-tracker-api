import { FastifyInstance } from '@/types/fastify'
import listCoins from './list-coins'
import getCoin from './get-coin'
import syncCoins from './sync-coins'
import convertCurrency from './convert-currency'
import { genericErrorSchema, successResponseSchema } from '@/schemas/route-schemas'

export async function cryptoRoutes(app: FastifyInstance) {
  app.get('/coins', {
    schema: {
      tags: ['crypto'],
      description: 'List all cryptocurrencies',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  symbol: { type: 'string' },
                  name: { type: 'string' },
                  current_price: { type: 'number' }
                }
              }
            }
          }
        },
        401: genericErrorSchema,
        500: genericErrorSchema
      }
    },
    onRequest: [app.authenticate]
  }, listCoins)

  app.get('/coins/:symbol', {
    schema: {
      tags: ['crypto'],
      description: 'Get details of a specific cryptocurrency',
      params: {
        type: 'object',
        required: ['symbol'],
        properties: {
          symbol: { type: 'string', description: 'Cryptocurrency symbol (e.g., btc)' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          vs_currency: { type: 'string', default: 'usd' },
          forceFetch: { type: 'boolean', default: false }
        }
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                symbol: { type: 'string' },
                name: { type: 'string' },
                current_price: { type: 'number' },
                market_cap: { type: 'number' },
                market_cap_rank: { type: 'number' },
                price_change_24h: { type: 'number' },
                price_change_percentage_24h: { type: 'number' }
              }
            }
          }
        },
        401: genericErrorSchema,
        404: genericErrorSchema,
        500: genericErrorSchema
      }
    },
    onRequest: [app.authenticate]
  }, getCoin)

  app.post('/coins/sync', {
    schema: {
      tags: ['crypto'],
      description: 'Manually trigger cryptocurrency data synchronization',
      security: [{ bearerAuth: [] }],
      response: {
        200: successResponseSchema,
        401: genericErrorSchema,
        500: genericErrorSchema
      }
    },
    onRequest: [app.authenticate]
  }, syncCoins)

  app.post('/coins/convert', {
    schema: {
      tags: ['crypto'],
      description: 'Convert amount between cryptocurrencies',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['fromSymbol', 'toSymbol', 'amount'],
        properties: {
          fromSymbol: { type: 'string', description: 'Source cryptocurrency symbol' },
          toSymbol: { type: 'string', description: 'Target cryptocurrency symbol' },
          amount: { type: 'number', description: 'Amount to convert' },
          vs_currency: { type: 'string', default: 'usd' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                fromAmount: { type: 'number' },
                toAmount: { type: 'number' },
                rate: { type: 'number' }
              }
            }
          }
        },
        400: genericErrorSchema,
        401: genericErrorSchema,
        500: genericErrorSchema
      }
    },
    onRequest: [app.authenticate]
  }, convertCurrency)
}

