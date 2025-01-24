import { FastifyReply, FastifyRequest } from "fastify"
import { makeListUsersUseCase } from "@/factories/user.factory"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import {
  createPaginationSchema,
  getPaginationArgs,
  createPaginatedResponse
} from "@/utils/pagination"

const sortFields = z.enum(['id', 'first_name', 'last_name', 'username', 'email'])
const listUsersQuerySchema = createPaginationSchema(sortFields, 'id')

export default async function listUsers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const queryValidation = listUsersQuerySchema.safeParse(request.query)

    if (!queryValidation.success) {
      return reply.status(400).send({
        message: 'Invalid query parameters',
        errors: queryValidation.error.format()
      })
    }

    const params = queryValidation.data
    const { skip, take } = getPaginationArgs(params)

    const findManyArgs: Prisma.UserFindManyArgs = {
      skip,
      take,
      where: {
        deleted_at: null,
        ...(params.search && {
          OR: [
            { first_name: { contains: params.search, mode: 'insensitive' } },
            { last_name: { contains: params.search, mode: 'insensitive' } },
            { username: { contains: params.search, mode: 'insensitive' } },
            { email: { contains: params.search, mode: 'insensitive' } }
          ]
        })
      },
      orderBy: {
        [params.sort]: params.order
      }
    }

    const countArgs: Prisma.UserCountArgs = {
      where: findManyArgs.where
    }

    const [users, total] = await Promise.all([
      makeListUsersUseCase().execute(findManyArgs),
      makeListUsersUseCase().count(countArgs)
    ])

    return reply.status(200).send(createPaginatedResponse(users, total, params))
  } catch (error) {
    console.error('Failed to list users:', error)
    return reply.status(500).send({
      message: 'Internal server error'
    })
  }
}
