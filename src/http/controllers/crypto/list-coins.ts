import { FastifyReply, FastifyRequest } from "fastify"
import { makeListCoinsUseCase } from "@/factories/crypto.factory"
import { z } from "zod"
import {
  createPaginationSchema,
  getPaginationArgs,
  createPaginatedResponse
} from "@/utils/pagination"
import { json } from "@/lib/json"

const sortFields = z.enum(['market_cap', 'name', 'symbol', 'high_24h', 'low_24h'])
const listCoinsQuerySchema = createPaginationSchema(sortFields, 'market_cap').extend({
  vs_currency: z.string().default('usd'),
  forceFetch: z.string().optional().transform((val) => {
    if (!val) return undefined;
    return val.toLowerCase() === 'true';
  })
})

export default async function listCoins(request: FastifyRequest, reply: FastifyReply) {
  try {
    const queryValidation = listCoinsQuerySchema.safeParse(request.query)

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

    const [coins, total] = await makeListCoinsUseCase().execute({
      vs_currency: params.vs_currency,
      skip,
      take,
      search: params.search,
      sort: params.sort,
      order: params.order,
      page: Number(params.page),
      forceFetch: params.forceFetch
    })

    return reply.status(200).send(createPaginatedResponse(coins, total, params))
  } catch (error) {
    console.error('Failed to list coins:', error)
    return reply.status(500).send(
      json({
        success: false,
        message: 'Internal server error'
      })
    )
  }
}