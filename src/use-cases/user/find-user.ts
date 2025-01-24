import { UserRepository } from '@/repositories/user.repository'
import { User } from '@prisma/client'

export class FindUserUseCase {
  constructor(private userRepository: UserRepository) { }

  async byEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findUserByEmail(email)

    return user
  }

  async byId(id: number): Promise<User | null> {
    const user = await this.userRepository.findUserById(id)

    return user
  }

  async byUsername(username: string): Promise<User | null> {
    const user = await this.userRepository.findUserByUsername(username)

    return user
  }

  async byUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    let user = await this.userRepository.findUserByUsername(usernameOrEmail)

    if (!user) {
      user = await this.userRepository.findUserByEmail(usernameOrEmail)
    }

    return user
  }

  async byPhone(phone: string): Promise<User | null> {
    const user = await this.userRepository.findUserByPhone(phone)
    return user
  }
}
