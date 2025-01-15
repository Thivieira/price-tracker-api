import fastify from 'fastify'

import registerPlugins from '@/plugins'
import registerMiddlewares from '@/middlewares'
import setupAppHandlers from '@/handlers'
import { userRoutes } from '@/http/controllers/user/routes'

export const app = fastify({
  logger: true,
  ignoreTrailingSlash: true
})

registerPlugins(app)
registerMiddlewares(app)
// Rotas
app.register(userRoutes)
// app.register(cryptoRoutes, { prefix: "/crypto" });

setupAppHandlers(app)
