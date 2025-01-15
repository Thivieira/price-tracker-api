import '@fastify/jwt'

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    isAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
