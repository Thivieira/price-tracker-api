import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateUserProfileUseCase, makeFindUserUseCase } from '@/factories/user.factory'
import bcrypt from 'bcrypt'
import { json } from '@/lib/json'


export default async function updatePassword(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const updatePasswordBodySchema = z.object({
      current_password: z.string().min(6),
      new_password: z.string().min(6),
      confirm_new_password: z.string().min(6),
    }).refine((data) => data.new_password === data.confirm_new_password, {
      message: "Passwords don't match",
      path: ["confirm_new_password"],
    })

    const { current_password, new_password } = updatePasswordBodySchema.parse(
      request.body as UpdateProfileRequest
    )

    const user = await makeFindUserUseCase().byId(Number(request.user.sub))

    if (!user) {
      throw new Error('User not found')
    }

    const validCurrentPassword = await bcrypt.compare(current_password, user.password)

    if (!validCurrentPassword) {
      throw new Error('Current password is incorrect')
    }

    await makeUpdateUserProfileUseCase().updatePassword(Number(user.id), new_password)

    reply.status(200).send(
      json({
        success: true,
        message: 'Password updated successfully',
      }),
    )
  } catch (error) {
    console.log(error)
    reply.status(500).send(
      json({
        success: false,
        message: 'Failed to update password',
      }),
    )
  }
}
