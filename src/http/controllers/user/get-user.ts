import { makeFindUserUseCase } from "@/factories/user.factory"
import { FastifyReply, FastifyRequest } from "fastify"

export default async function getUser(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params

  const user = await makeFindUserUseCase().byId(Number(id))

  if (!user) {
    return reply.status(404).send({ message: 'User not found' })
  }

  // remove sensitive fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, hashed_pin, role, ...userWithoutSensitiveFields } = user

  return reply.status(200).send(userWithoutSensitiveFields)
}
