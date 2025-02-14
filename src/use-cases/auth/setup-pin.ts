import { UserRepository } from "@/repositories/user.repository";
import bcrypt from 'bcrypt'

export class SetupPinUseCase {
  private readonly PIN_EXPIRY_MINUTES = 10;

  constructor(private userRepository: UserRepository) { }

  async execute(userId: number, raw_pin: string) {
    const hashedPin = await bcrypt.hash(raw_pin, 10);
    const expires_at = new Date(Date.now() + this.PIN_EXPIRY_MINUTES * 60 * 1000);

    await this.userRepository.updatePin(userId, hashedPin)
    await this.userRepository.updatePinExpiration(userId, expires_at)
  }
} 