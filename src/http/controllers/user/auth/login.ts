import { makeFindUserUseCase, makeLoginUseCase } from '@/factories/user.factory';
import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcrypt'

export default async function login(request: FastifyRequest, reply: FastifyReply) {
  const { username_or_email, password } = request.body as { username_or_email: string; password: string }

  const user = await makeFindUserUseCase().byUsernameOrEmail(username_or_email)

  if (!user) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
  try {
    const data = await makeLoginUseCase().execute(Number(user.id))
    return reply.send({ accessToken: data.accessToken, refreshToken: data.refreshToken })
  } catch (error) {
    console.log(error)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}
