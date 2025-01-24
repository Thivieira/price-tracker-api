import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { prisma } from './lib/prisma'
import { env } from './env'

export default function setupAppHandlers(app: FastifyInstance) {
  app.setErrorHandler((error, _, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ message: 'Validation error.', issues: error.format() })
    }

    if (env.NODE_ENV !== 'production') {
      console.error(error)
    } else {
      // TODO: Here we should log to an external tool
      console.error(error)
      console.log(error)
    }

    return reply.status(200).send({ message: 'Internal server error.' })
  })

  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}
