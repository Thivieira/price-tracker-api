import { type CreateUserSchemaWithExtraFields } from '@/schemas/user.schema'
import { UserRepository } from '@/repositories/user.repository'
import { User } from '@prisma/client'
export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(userData: CreateUserSchemaWithExtraFields): Promise<User> {
    return await this.userRepository.createUser(userData)
  }
}
