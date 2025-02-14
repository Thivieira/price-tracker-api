import { FastifyInstance } from 'fastify'
import toggleBookmark from './toggle-bookmark'
import listBookmarks from './list-bookmarks'
import { genericErrorSchema } from '@/schemas/route-schemas'

const bookmarkResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          user_id: { type: 'number', example: 1 },
          coin_id: { type: 'number', example: 1 },
          coin: {
            type: 'object',
            properties: {
              symbol: { type: 'string', example: 'btc', description: 'Cryptocurrency symbol' },
              name: { type: 'string', example: 'Bitcoin', description: 'Cryptocurrency name' },
              current_price: { type: 'number', example: 45000.50, description: 'Current price in USD' }
            }
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            example: '2024-03-20T10:00:00Z'
          }
        }
      }
    }
  }
}

export async function bookmarkRoutes(app: FastifyInstance) {
  app.post('/bookmarks/:coinId', {
    schema: {
      tags: ['bookmarks'],
      description: 'Toggle bookmark status for a cryptocurrency',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['coinId'],
        properties: {
          coinId: {
            type: 'string',
            description: 'Cryptocurrency symbol (e.g., btc)'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            action: {
              type: 'string',
              enum: ['added', 'removed']
            }
          }
        },
        404: genericErrorSchema,
        500: genericErrorSchema
      }
    },
    onRequest: [app.authenticate]
  }, toggleBookmark)

  app.get('/bookmarks', {
    schema: {
      tags: ['bookmarks'],
      description: 'List all bookmarked cryptocurrencies for the current user',
      security: [{ bearerAuth: [] }],
      response: {
        200: bookmarkResponseSchema,
        401: genericErrorSchema,
        500: genericErrorSchema
      }
    },
    onRequest: [app.authenticate]
  }, listBookmarks)
} 