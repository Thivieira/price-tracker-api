import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { json } from '@/lib/json'
import { makeFindUserUseCase } from '@/factories/user.factory'
import { makeSetupPinUseCase } from '@/factories/pin.factory'

export default async function setupPin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const setupPinBodySchema = z.object({
      raw_pin: z.string().min(4).max(4).regex(/^\d+$/, 'PIN must contain only numbers')
    })

    const { raw_pin } = setupPinBodySchema.parse(request.body)

    const userId = Number(request.user.sub)
    const user = await makeFindUserUseCase().byId(userId)

    if (!user) {
      return reply.status(404).send(
        json({
          success: false,
          message: 'User not found',
        }),
      )
    }

    await makeSetupPinUseCase().execute(userId, raw_pin)

    return reply.status(200).send(
      json({
        success: true,
        message: 'PIN setup successfully',
      }),
    )
  } catch (error) {
    console.error(error)

    if (error instanceof z.ZodError) {
      return reply.status(400).send(
        json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        }),
      )
    }

    return reply.status(500).send(
      json({
        success: false,
        message: 'Failed to setup PIN',
      }),
    )
  }
}
