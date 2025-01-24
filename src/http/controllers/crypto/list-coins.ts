import { FastifyReply, FastifyRequest } from "fastify"
import { makeListCoinsUseCase } from "@/factories/crypto.factory"

export default async function listCoins(request: FastifyRequest, reply: FastifyReply) {
  const coins = await makeListCoinsUseCase().execute({})
  const count = await makeListCoinsUseCase().count({})
  return reply.send({ coins, count })
}