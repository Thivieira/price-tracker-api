import { InvalidCredentialsError } from "@/exceptions/auth.exceptions";
import { UserRepository } from "@/repositories/user.repository";
import bcrypt from 'bcrypt'

export class PinUseCase {
  constructor(
    private userRepository: UserRepository
  ) { }

  async verify(userId: number, raw_pin: string) {
    const user = await this.userRepository.findUserById(userId)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    if (!user.hashed_pin || !user.pin_expires_at) {
      throw new Error('No PIN verification pending')
    }

    if (new Date() > user.pin_expires_at) {
      throw new Error('PIN has expired')
    }

    const isValidPin = await bcrypt.compare(raw_pin, user.hashed_pin)

    if (!isValidPin) {
      throw new InvalidCredentialsError()
    }

    await this.userRepository.updatePinExpiration(userId, null)


  }
}
