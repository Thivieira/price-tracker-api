import { FastifyReply, FastifyRequest } from "fastify"
import { makeFindUserUseCase } from "@/factories/user.factory"
import { z } from "zod"
import { json } from "@/lib/json"
import { prisma } from "@/lib/prisma"

export default async function restoreUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const paramsSchema = z.object({
      id: z.string().or(z.number()).transform(Number),
    })

    const { id } = paramsSchema.parse(request.params)

    const user = await makeFindUserUseCase().byId(id)

    if (!user) {
      return reply.status(404).send(
        json({
          success: false,
          message: 'User not found',
        })
      )
    }

    if (!user.deleted_at) {
      return reply.status(400).send(
        json({
          success: false,
          message: 'User is not deleted',
        })
      )
    }

    await prisma.user.update({
      where: { id },
      data: { deleted_at: null }
    })

    return reply.status(200).send(
      json({
        success: true,
        message: 'User restored successfully',
      })
    )
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return reply.status(400).send(
        json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        })
      )
    }

    return reply.status(500).send(
      json({
        success: false,
        message: 'Failed to restore user',
      })
    )
  }
} 