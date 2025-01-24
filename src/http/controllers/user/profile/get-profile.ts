import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetProfileUseCase } from '@/factories/user.factory'
import { hasValidAuthSubject } from '@/utils/valid-subject';

export default async function getProfile(request: FastifyRequest, reply: FastifyReply) {
  try {

    const userId = hasValidAuthSubject(request) ? (request.user as { sub: string }).sub : null;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const getProfileUseCase = makeGetProfileUseCase();
    const { user } = await getProfileUseCase.execute({ userId: Number(userId) });

    return reply.status(200).send({
      user,
    })
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send({ message: error.message })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}
