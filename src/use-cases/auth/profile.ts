import { User } from '@prisma/client'
import { UserRepository } from '@/repositories/user.repository'
import { UserNotFoundException } from '@/exceptions/user.exceptions'

interface GetProfileUseCaseRequest {
  userId: number
}

interface GetProfileUseCaseResponse {
  user: Omit<User, 'password' | 'hashed_pin' | 'role'>
}

export class GetProfileUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute({ userId }: GetProfileUseCaseRequest): Promise<GetProfileUseCaseResponse> {
    const user = await this.userRepository.findUserById(userId)

    if (!user) {
      throw new UserNotFoundException()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, hashed_pin, role, ...userWithoutSensitiveFields } = user

    return {
      user: userWithoutSensitiveFields,
    }
  }
}
