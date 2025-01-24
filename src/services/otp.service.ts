import { randomInt } from 'crypto'
import bcrypt from 'bcrypt'
import { createMessage } from '@/lib/twillio'

export class OTPService {
  private readonly OTP_LENGTH = 4
  private readonly SALT_ROUNDS = 10

  generateOTP(): string {
    const min = Math.pow(10, this.OTP_LENGTH - 1) // 10^(OTP_LENGTH-1) == 1000
    const max = Math.pow(10, this.OTP_LENGTH) - 1 // 10^OTP_LENGTH - 1 == 9999
    return randomInt(min, max).toString()
  }

  async hashOTP(otp: string): Promise<string> {
    return await bcrypt.hash(otp, this.SALT_ROUNDS)
  }

  async verifyOTP(plainOTP: string, hashedOTP: string): Promise<boolean> {
    return await bcrypt.compare(plainOTP, hashedOTP)
  }

  async sendOTP(otp: string, phone: string): Promise<void> {
    try {
      await createMessage(`Your verification code for Truther is: ${otp}`, phone)
    } catch (error) {
      if (error.code === 21211) {
        throw new Error('Invalid phone number format')
      }
      if (error.code === 21612) {
        throw new Error('Unable to send SMS to this number')
      }
      throw new Error('Failed to send verification code')
    }
  }
} 