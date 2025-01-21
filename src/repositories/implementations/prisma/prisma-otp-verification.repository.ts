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
        userId,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findLatestByPhone(phone: string): Promise<OTPVerification | null> {
    return await prisma.oTPVerification.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' }
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
