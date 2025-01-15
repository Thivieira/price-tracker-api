import { FastifyReply, FastifyRequest } from "fastify"

import { makeListUsersUseCase } from "@/factories/user.factory"
import { Prisma } from "@prisma/client"
import { listUsersQuerySchema } from "@/schemas/user.schema"

export default async function listUsers(request: FastifyRequest, reply: FastifyReply) {
  const queryValidation = listUsersQuerySchema.safeParse(request.query)

  if (!queryValidation.success) {
    return reply.status(400).send({
      message: 'Invalid query parameters',
      errors: queryValidation.error.format(),
    })
  }

  const params = queryValidation.data

  const skip = (Number(params.page) - 1) * Number(params.limit)
  const take = Number(params.limit)

  const findManyArgs: Prisma.UserFindManyArgs = {
    skip,
    take,
  }

  findManyArgs.where = {
    OR: [
      { first_name: { contains: params.search } },
      { last_name: { contains: params.search } },
      { username: { contains: params.search } },
      { email: { contains: params.search } },
    ],
  }

  findManyArgs.orderBy = {
    [params.sort]: params.order,
  }

  const users = await makeListUsersUseCase().execute(findManyArgs)

  const countArgs: Prisma.UserCountArgs = {
    skip: findManyArgs.skip,
    take: findManyArgs.take,
    where: findManyArgs.where,
  }

  const total = await makeListUsersUseCase().count(countArgs)

  return reply.status(200).send({
    data: users,
    meta: {
      total,
      page: params.page,
      limit: params.limit,
    },
  })
}
