import { OTPVerificationRepository } from '@/repositories/otp-verification.repository'
import { OTPService } from '@/services/otp.service'

export class OTPUseCase {
  private readonly EXPIRY_MINUTES = 10
  private readonly MAX_ATTEMPTS = 3
  private readonly COOLDOWN_MINUTES = 2

  constructor(
    private otpVerificationRepository: OTPVerificationRepository,
    private otpService: OTPService
  ) { }

  async generate(phone: string, userId?: number): Promise<void> {
    const existingOTP = await this.otpVerificationRepository.findLatestByPhone(phone)

    if (existingOTP) {
      const now = new Date()
      const timeDiff = (now.getTime() - existingOTP.created_at.getTime()) / (1000 * 60)

      if (timeDiff < this.COOLDOWN_MINUTES) {
        throw new Error(`Please wait ${Math.ceil(this.COOLDOWN_MINUTES - timeDiff)} minutes before requesting another OTP`)
      }

      await this.otpVerificationRepository.delete(existingOTP.id)
    }

    const otp = this.otpService.generateOTP()
    const hashedOTP = await this.otpService.hashOTP(otp)
    const expiresAt = new Date(Date.now() + this.EXPIRY_MINUTES * 60 * 1000)

    await this.otpVerificationRepository.create({
      userId,
      hashedOTP,
      expiresAt,
      attempts: 0,
      phone
    })

    await this.otpService.sendOTP(otp, phone)
  }

  async verify(phone: string, otp: string): Promise<{ verified: boolean; phone: string }> {
    const otpRecord = await this.otpVerificationRepository.findLatestByPhone(phone)

    if (!otpRecord) {
      throw new Error('OTP expired or not found')
    }

    if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
      throw new Error('Maximum verification attempts exceeded')
    }

    const isValid = await this.otpService.verifyOTP(otp, otpRecord.hashed_otp)

    await this.otpVerificationRepository.incrementAttempts(otpRecord.id)

    if (!isValid) {
      throw new Error('Invalid OTP')
    }

    await this.otpVerificationRepository.delete(otpRecord.id)

    return {
      verified: true,
      phone: otpRecord.phone
    }
  }
} 