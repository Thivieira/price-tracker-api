import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: number | string
      role?: string
    }
    user: {
      sub: number | string
      role?: string
    }
  }
} 