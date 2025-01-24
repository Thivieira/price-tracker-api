import { FastifyReply, FastifyRequest } from "fastify"
import { makeFindUserUseCase } from "@/factories/user.factory"
import { z } from "zod"
import { json } from "@/lib/json"
import { prisma } from "@/lib/prisma"

export default async function permanentlyDeleteUser(request: FastifyRequest, reply: FastifyReply) {
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

    // Delete related records first
    await prisma.refreshToken.deleteMany({
      where: { userId: id }
    })

    await prisma.oTPVerification.deleteMany({
      where: { userId: id }
    })

    // Finally delete the user
    await prisma.user.delete({
      where: { id }
    })

    return reply.status(200).send(
      json({
        success: true,
        message: 'User permanently deleted successfully',
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
        message: 'Failed to permanently delete user',
      })
    )
  }
} 