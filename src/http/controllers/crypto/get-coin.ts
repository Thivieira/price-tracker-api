import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"
import { json } from "@/lib/json"
import { makeGetCoinUseCase } from "@/factories/crypto.factory"

const getCoinParamsSchema = z.object({
  id: z.coerce.number({
    required_error: "Coin ID is required",
    invalid_type_error: "Coin ID must be a number"
  })
})

export default async function getCoin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const paramsValidation = getCoinParamsSchema.safeParse(request.params)

    if (!paramsValidation.success) {
      return reply.status(400).send(
        json({
          success: false,
          message: 'Invalid parameters',
          errors: paramsValidation.error.format()
        })
      )
    }

    const { id } = paramsValidation.data
    const getCoinUseCase = makeGetCoinUseCase()

    const coin = await getCoinUseCase.execute(id)

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