import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { makeFindUserUseCase } from './factories/user.factory'
import { Role } from '@prisma/client'

export default function registerMiddlewares(app: FastifyInstance) {
  app.decorate(
    'authenticate',
    async function authenticate(request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify()
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' })
      }
    },
  )

  app.decorate(
    'isAdmin',
    async function isAdmin(request: FastifyRequest, reply: FastifyReply) {
      const subject = request.user.sub
      const user = await makeFindUserUseCase().byId(subject)

      if (user?.role !== Role.ADMIN) {
        reply.status(403).send({ error: 'Forbidden' })
      }
    },
  )
}
