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
    swagger: {
      info: {
        title: 'Crypto Price Tracker API',
        description: 'API documentation for the Cryptocurrency Price Tracking application',
        version: '1.0.0'
      },
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header'
        }
      }
    }
  })

  app.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  })

  // app.register(formbody)
  // app.register(multipart, { attachFieldsToBody: true })
}
