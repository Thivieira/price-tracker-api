import { UserRepository } from '@/repositories/user.repository'
import { prisma } from '@/lib/prisma'
import { Prisma, User } from '@prisma/client'

import { UserCreationException } from '@/exceptions/user.exceptions'

export class PrismaUserRepository implements UserRepository {
  constructor() { }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      return await prisma.user.create({
        data: userData,
      })
    } catch (error) {
      console.error(error)
      throw new UserCreationException('Failed to create user')
    }
  }

  async updateUser(userId: number, userData: User): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: userData,
    })
  }

  async findUsers(params: Prisma.UserFindManyArgs): Promise<User[]> {
    return await prisma.user.findMany(params)
  }

  async countUsers(params: Prisma.UserCountArgs): Promise<number> {
    return await prisma.user.count(params)
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } })
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { username } })
  }

  async findUserById(userId: number): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id: userId } })
  }

  async updatePassword(userId: number, password: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { password },
    })
  }

  async updatePin(userId: number, hashed_pin: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { hashed_pin },
    })
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { phone } })
  }

}
