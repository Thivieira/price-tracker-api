import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { InvalidCredentialsError } from '@/exceptions/auth.exceptions'
import { makePinUseCase } from '@/factories/pin.factory'

export default async function verifyPin(
  request: FastifyRequest,
  reply: FastifyReply,
) {

  const userId = Number(request.user.sub)

  const verifyPinBodySchema = z.object({
    pin: z.string().min(4).max(4).regex(/^\d+$/),
  })

  const { pin } = verifyPinBodySchema.parse(request.body)

  try {
    await makePinUseCase().verify(userId, pin)
    return reply.status(200).send({
      message: 'PIN verified successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        issues: error.format(),
      })
    }

    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({
        message: error.message,
      })
    }

    throw error
  }
}
