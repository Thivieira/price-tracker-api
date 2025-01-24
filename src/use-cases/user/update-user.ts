import { UpdateProfileRequest } from '@/schemas/user.schema'
import { UserRepository } from '@/repositories/user.repository'
import bcrypt from 'bcrypt'

export class UpdateUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: number, data: UpdateProfileRequest) {
    const updatedData = {
      ...data,
      id: userId,
      updated_at: new Date(),
    }
    return this.userRepository.updateUser(userId, updatedData);
  }

  async updatePin(userId: number, pin: string) {
    const hashedPin = await bcrypt.hash(pin, 10);
    return this.userRepository.updatePin(userId, hashedPin);
  }

  async updatePassword(userId: number, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10)
    return this.userRepository.updatePassword(userId, hashedPassword)
  }
}
