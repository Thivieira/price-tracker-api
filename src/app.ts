import fastify from 'fastify'

import registerPlugins from '@/plugins'
import registerMiddlewares from '@/middlewares'
import setupAppHandlers from '@/handlers'
import { userRoutes } from '@/http/controllers/user/routes'
import { cryptoRoutes } from './http/controllers/crypto/routes'
import { bookmarkRoutes } from './http/controllers/bookmark/routes'

export const app = fastify({
  logger: true,
  ignoreTrailingSlash: true
})

registerPlugins(app)
registerMiddlewares(app)
// Rotas
app.register(userRoutes)
app.register(cryptoRoutes)
app.register(bookmarkRoutes)

setupAppHandlers(app)
