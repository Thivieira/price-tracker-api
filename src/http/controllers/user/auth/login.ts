import { makeFindUserUseCase, makeLoginUseCase } from '@/factories/user.factory';
import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcrypt'
import { z } from 'zod'

const loginSchema = z.object({
  username_or_email: z.string(),
  password: z.string()
})

export const loginOpts = {
  schema: {
    tags: ['auth'],
    description: 'Authenticate a user and receive access/refresh tokens',
    body: {
      type: 'object',
      required: ['username_or_email', 'password'],
      properties: {
        username_or_email: { type: 'string', description: 'Username or email of the user' },
        password: { type: 'string', format: 'password', description: 'User password' }
      }
    },
    response: {
      200: {
        description: 'Successful response',
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' }
        }
      },
      401: {
        description: 'Unauthorized',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      },
      500: {
        description: 'Internal Server Error',
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
}

export default async function login(request: FastifyRequest, reply: FastifyReply) {
  const body = loginSchema.parse(request.body)

  const user = await makeFindUserUseCase().byUsernameOrEmail(body.username_or_email)

  if (!user) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const isPasswordValid = await bcrypt.compare(body.password, user.password)

  if (!isPasswordValid) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  try {
    const data = await makeLoginUseCase().execute(Number(user.id))
    return reply.send({ accessToken: data.accessToken, refreshToken: data.refreshToken })
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}
