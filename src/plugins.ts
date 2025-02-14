import { FastifyInstance } from 'fastify/types/instance'

import cors from '@fastify/cors'
import { fastifyJwt } from '@fastify/jwt'
import { env } from './env'
// import formbody from '@fastify/formbody'
// import multipart from '@fastify/multipart'
import swagger from '@fastify/swagger'
import rateLimit from '@fastify/rate-limit'
import swaggerUi from '@fastify/swagger-ui'

export default function registerPlugins(app: FastifyInstance) {
  app.register(cors)

  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  })

  app.register(fastifyJwt, {
    secret: env.ACCESS_TOKEN_SECRET,
    cookie: {
      cookieName: 'refreshToken',
      signed: false,
    },
    sign: {
      expiresIn: '1h',
    },
  })

  app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Crypto Price Tracker API',
        description: 'API documentation for the Cryptocurrency Price Tracking application',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@example.com'
        },
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development server',
        },
        {
          url: 'https://api.your-production-url.com',
          description: 'Production server',
        },
      ],
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'users', description: 'User management endpoints' },
        { name: 'crypto', description: 'Cryptocurrency related endpoints' },
        { name: 'bookmarks', description: 'Bookmark management endpoints' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    hideUntagged: true,
    exposeRoute: true,
  })

  app.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      displayRequestDuration: true,
      filter: true
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  })

  // app.register(formbody)
  // app.register(multipart, { attachFieldsToBody: true })
}
