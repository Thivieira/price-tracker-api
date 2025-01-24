import { prisma } from '@/lib/prisma'
import { OTPVerification } from '@prisma/client'
import { OTPVerificationRepository } from '@/repositories/otp-verification.repository'

export class PrismaOTPVerificationRepository implements OTPVerificationRepository {
  async create(data: {
    userId?: number
    hashedOTP: string
    expiresAt: Date
    attempts: number
    phone: string
  }): Promise<OTPVerification> {
    return await prisma.oTPVerification.create({
      data
    })
  }

  async findLatestByUserId(userId: number): Promise<OTPVerification | null> {
    return await prisma.oTPVerification.findFirst({
      where: {
        user_id: userId,
        expires_at: {
          gt: new Date()
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })
  }

  async findLatestByPhone(phone: string): Promise<OTPVerification | null> {
    return await prisma.oTPVerification.findFirst({
      where: { phone },
      orderBy: { created_at: 'desc' }
    })
  }

  async incrementAttempts(id: number): Promise<void> {
    await prisma.oTPVerification.update({
      where: { id },
      data: {
        attempts: {
          increment: 1
        }
      }
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.oTPVerification.delete({
      where: { id }
    })
  }
}
