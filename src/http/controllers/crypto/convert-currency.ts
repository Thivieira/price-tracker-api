import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeConvertCurrencyUseCase } from '@/factories/crypto.factory'
import { json } from '@/lib/json'

const convertCurrencySchema = z.object({
  fromSymbol: z.string(),
  toSymbol: z.string(),
  amount: z.number().positive(),
  vs_currency: z.string().default('usd')
})

export default async function convertCurrency(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const validation = convertCurrencySchema.safeParse(request.body)

    console.log("REQUEST BODY: ", request.body)

    if (!validation.success) {
      return reply.status(400).send(
        json({
          success: false,
          message: 'Invalid request parameters',
          errors: validation.error.format()
        })
      )
    }

    const convertCurrencyUseCase = makeConvertCurrencyUseCase()
    const result = await convertCurrencyUseCase.execute(validation.data)

    return reply.status(200).send(
      json({
        success: true,
        data: result
      })
    )
  } catch (error) {
    console.error('Failed to convert currency:', error)
    return reply.status(500).send(
      json({
        success: false,
        message: 'Failed to convert currency'
      })
    )
  }
} 