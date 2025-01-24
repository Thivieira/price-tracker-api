import { OTPVerification } from '@prisma/client'

export interface OTPVerificationRepository {
  create(data: {
    userId?: number
    hashedOTP: string
    expiresAt: Date
    attempts: number
    phone: string
  }): Promise<OTPVerification>
  findLatestByPhone(phone: string): Promise<OTPVerification | null>
  findLatestByUserId(userId: number): Promise<OTPVerification | null>
  incrementAttempts(id: number): Promise<void>
  delete(id: number): Promise<void>
} 