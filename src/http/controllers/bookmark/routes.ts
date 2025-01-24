import { FastifyInstance } from 'fastify'
import toggleBookmark from './toggle-bookmark'
import listBookmarks from './list-bookmarks'

export async function bookmarkRoutes(app: FastifyInstance) {
  app.post('/bookmarks/:coinId', { onRequest: [app.authenticate] }, toggleBookmark)
  app.get('/bookmarks', { onRequest: [app.authenticate] }, listBookmarks)
} 