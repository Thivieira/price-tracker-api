import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"
import { json } from "@/lib/json"
import { makeGetCoinUseCase } from "@/factories/crypto.factory"

const getCoinParamsSchema = z.object({
  symbol: z.string({
    required_error: "Coin symbol is required",
    invalid_type_error: "Coin symbol must be a string"
  })
})

const getCoinQuerySchema = z.object({
  vs_currency: z.string().default('usd'),
  forceFetch: z.string().optional().transform((val) => {
    if (!val) return undefined
    return val.toLowerCase() === 'true'
  })
})

export default async function getCoin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const paramsValidation = getCoinParamsSchema.safeParse(request.params)
    const queryValidation = getCoinQuerySchema.safeParse(request.query)

    if (!paramsValidation.success) {
      return reply.status(400).send(
        json({
          success: false,
          message: 'Invalid parameters',
          errors: paramsValidation.error.format()
        })
      )
    }

    if (!queryValidation.success) {
      return reply.status(400).send(
        json({
          success: false,
          message: 'Invalid query parameters',
          errors: queryValidation.error.format()
        })
      )
    }

    const { symbol } = paramsValidation.data
    const { vs_currency, forceFetch } = queryValidation.data
    const getCoinUseCase = makeGetCoinUseCase()

    const coin = await getCoinUseCase.execute({
      symbol,
      vs_currency,
      forceFetch
    })

    if (!coin) {
      return reply.status(404).send(
        json({
          success: false,
          message: 'Cryptocurrency not found'
        })
      )
    }

    return reply.status(200).send(
      json({
        success: true,
        data: coin
      })
    )
  } catch (error) {
    console.error('Failed to get coin:', error)
    return reply.status(500).send(
      json({
        success: false,
        message: 'Internal server error'
      })
    )
  }
}