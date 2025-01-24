import { FastifyReply, FastifyRequest } from "fastify"
import { makeUpdateUserProfileUseCase, makeFindUserUseCase } from "@/factories/user.factory"
import { z } from "zod"
import { json } from "@/lib/json"
import { Role } from "@prisma/client"

export default async function updateUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const paramsSchema = z.object({
      id: z.string().or(z.number()).transform(Number),
    })

    const updateUserSchema = z.object({
      first_name: z.string().min(2).optional(),
      last_name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      phone: z.string().min(10).optional(),
      role: z.enum([Role.ADMIN, Role.CUSTOMER]).optional(),
      street_address: z.string().min(5).optional(),
      unit_number: z.string().optional(),
      city: z.string().min(2).optional(),
      region: z.string().min(2).optional(),
      zip_code: z.string().min(5).optional(),
    })

    const { id } = paramsSchema.parse(request.params)
    const updateData = updateUserSchema.parse(request.body)

    const user = await makeFindUserUseCase().byId(id)

    if (!user) {
      return reply.status(404).send(
        json({
          success: false,
          message: 'User not found',
        })
      )
    }

    if (updateData.email) {
      const existingUser = await makeFindUserUseCase().byEmail(updateData.email)
      if (existingUser && existingUser.id !== id) {
        return reply.status(400).send(
          json({
            success: false,
            message: 'Email already in use',
          })
        )
      }
    }

    if (updateData.phone) {
      const existingUser = await makeFindUserUseCase().byPhone(updateData.phone)
      if (existingUser && existingUser.id !== id) {
        return reply.status(400).send(
          json({
            success: false,
            message: 'Phone number already in use',
          })
        )
      }
    }

    await makeUpdateUserProfileUseCase().execute(id, updateData)

    return reply.status(200).send(
      json({
        success: true,
        message: 'User updated successfully',
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
        message: 'Failed to update user',
      })
    )
  }
} 