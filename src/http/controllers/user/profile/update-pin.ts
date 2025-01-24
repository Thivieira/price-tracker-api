import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateUserProfileUseCase, makeFindUserUseCase } from '@/factories/user.factory'
import bcrypt from 'bcrypt'
import { json } from '@/lib/json'

export default async function updatePin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { new_pin } = request.body

    const updatePinBodySchema = z.object({
      current_pin: z.string().length(4).regex(/^\d+$/, 'PIN must contain only numbers'),
      new_pin: z.string().length(4).regex(/^\d+$/, 'PIN must contain only numbers'),
      confirm_new_pin: z
        .string()
        .length(4)
        .regex(/^\d+$/, 'PIN must contain only numbers')
        .refine((data) => data === new_pin, "PINs don't match"),
    })

    const { current_pin } = updatePinBodySchema.parse(request.body)

    const user = await makeFindUserUseCase().byId(Number(request.user.sub))

    if (!user) {
      return reply.status(404).send(
        json({
          success: false,
          message: 'User not found',
        }),
      )
    }

    const validCurrentPin = await bcrypt.compare(current_pin, user.hashed_pin)

    if (!validCurrentPin) {
      return reply.status(400).send(
        json({
          success: false,
          message: 'Current PIN is incorrect',
        }),
      )
    }

    await makeUpdateUserProfileUseCase().updatePin(Number(user.id), new_pin)

    return reply.status(200).send(
      json({
        success: true,
        message: 'PIN updated successfully',
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
        message: 'Failed to update PIN',
      }),
    )
  }
}
