import { PrismaOTPVerificationRepository } from '@/repositories/implementations/prisma/prisma-otp-verification.repository'
import { OTPService } from '@/services/otp.service'
import { OTPUseCase } from '@/use-cases/auth/otp'

export function makeOTPVerificationRepository() {
  return new PrismaOTPVerificationRepository()
}

export function makeOTPService() {
  return new OTPService()
}

export function makeOTPUseCase() {
  const otpVerificationRepository = makeOTPVerificationRepository()
  const otpService = makeOTPService()
  return new OTPUseCase(otpVerificationRepository, otpService)
} 