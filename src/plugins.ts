import { FastifyInstance } from 'fastify/types/instance'

import cors from '@fastify/cors'
import { fastifyJwt } from '@fastify/jwt'
import { env } from './env'
// import formbody from '@fastify/formbody'
// import multipart from '@fastify/multipart'
import swagger from '@fastify/swagger'
import rateLimit from '@fastify/rate-limit'

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
        title: 'Cripto Price Tracker',
        description: 'Cripto Price Tracker API',
        version: '0.1.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'user', description: 'User related end-points' },
        { name: 'code', description: 'Code related end-points' },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'apiKey',
            in: 'header',
          },
        },
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here',
      },
    },
  })

  // app.register(formbody)
  // app.register(multipart, { attachFieldsToBody: true })
}
