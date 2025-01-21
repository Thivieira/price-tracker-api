import { FastifyRequest, FastifyReply } from 'fastify'
import { makeOTPUseCase } from '@/factories/otp.factory'
import { makeFindUserUseCase } from '@/factories/user.factory'
import { z } from 'zod'
import { json } from '@/lib/json'

export async function sendOTP(request: FastifyRequest, reply: FastifyReply) {
  try {
    const schema = z.object({
      phone: z.string()
        .min(12, 'Phone number must be at least 12 characters')
        .max(15, 'Phone number must not exceed 15 characters')
        .regex(
          /^\+[1-9]\d{1,14}$/,
          'Invalid phone number format. Must be E.164 format (e.g., +15005550006)'
        )
        .transform((phone) => {
          // Remove all non-digit characters except leading +
          const cleaned = phone.replace(/[^\d+]/g, '');
          // Ensure number starts with + if it doesn't already
          return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
        })
    })

    const { phone } = schema.parse(request.body)
    const user = await makeFindUserUseCase().byPhone(phone)

    // For new phone numbers, create a temporary verification
    if (!user) {
      await makeOTPUseCase().generate(phone)

      return reply.status(200).send(json({
        success: true,
        code: 'OTP_SENT_NEW',
        message: 'Verification code sent successfully',
        isNewPhone: true
      }))
    }

    // For existing users, verify their phone
    await makeOTPUseCase().generate(phone, user.id)

    return reply.status(200).send(json({
      success: true,
      code: 'OTP_SENT_EXISTING',
      message: 'Verification code sent successfully',
      isNewPhone: false
    }))
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return reply.status(400).send(json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Invalid phone number format',
        errors: error.errors
      }))
    }

    return reply.status(500).send(json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Failed to send OTP'
    }))
  }
}

export async function resendOTP(request: FastifyRequest, reply: FastifyReply) {
  try {
    const schema = z.object({
      phone: z.string()
        .min(12, 'Phone number must be at least 12 characters')
        .max(15, 'Phone number must not exceed 15 characters')
        .regex(
          /^\+[1-9]\d{1,14}$/,
          'Invalid phone number format. Must be E.164 format (e.g., +15005550006)'
        )
        .transform((phone) => {
          // Remove all non-digit characters except leading +
          const cleaned = phone.replace(/[^\d+]/g, '');
          // Ensure number starts with + if it doesn't already
          return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
        })
    })

    const { phone } = schema.parse(request.body)
    const user = await makeFindUserUseCase().byPhone(phone)

    // For both new and existing phone numbers, generate OTP
    await makeOTPUseCase().generate(phone, user?.id)

    return reply.status(200).send(json({
      success: true,
      code: 'OTP_RESENT',
      message: 'Verification code resent successfully',
      isNewPhone: !user
    }))
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return reply.status(400).send(json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Invalid phone number format',
        errors: error.errors
      }))
    }

    return reply.status(500).send(json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Failed to resend OTP'
    }))
  }
}