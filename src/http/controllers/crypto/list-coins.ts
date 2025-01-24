import { FastifyReply, FastifyRequest } from "fastify"
import { makeListCoinsUseCase } from "@/factories/crypto.factory"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import {
  createPaginationSchema,
  getPaginationArgs,
  createPaginatedResponse
} from "@/utils/pagination"
import { json } from "@/lib/json"
const sortFields = z.enum(['market_cap', 'name', 'symbol', 'high_24h', 'low_24h']);
const listCoinsQuerySchema = createPaginationSchema(sortFields, 'market_cap');

export default async function listCoins(request: FastifyRequest, reply: FastifyReply) {
  try {
    const queryValidation = listCoinsQuerySchema.safeParse(request.query);

    if (!queryValidation.success) {
      return reply.status(400).send(
        json({
          success: false,
          message: 'Invalid query parameters',
          errors: queryValidation.error.format()
        })
      )
    }

    const params = queryValidation.data
    const { skip, take } = getPaginationArgs(params)

    const findManyArgs: Prisma.CryptocurrencyFindManyArgs = {
      skip,
      take,
      where: {
        deleted_at: null,
        ...(params.search && {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { symbol: { contains: params.search, mode: 'insensitive' } }
          ]
        })
      },
      orderBy: {
        [params.sort]: params.order
      }
    }

    const countArgs: Prisma.CryptocurrencyCountArgs = {
      where: findManyArgs.where
    }

    const [coins, total] = await Promise.all([
      makeListCoinsUseCase().execute(findManyArgs),
      makeListCoinsUseCase().count(countArgs)
    ])

    return reply.status(200).send(createPaginatedResponse(coins, total, params))
  } catch (error) {
    console.error('Failed to list coins:', error)
    return reply.status(500).send({
      message: 'Internal server error'
    })
  }
}