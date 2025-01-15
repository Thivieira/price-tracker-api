import { UserRepository } from '@/repositories/user.repository'
import { Prisma, User } from '@prisma/client'

export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) { }

  async execute(params: Prisma.UserFindManyArgs): Promise<User[]> {
    return await this.userRepository.findUsers(params)
  }

  async count(params: Prisma.UserCountArgs): Promise<number> {
    return await this.userRepository.countUsers(params)
  }
}
