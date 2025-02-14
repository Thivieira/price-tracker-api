import { FastifyRequest, FastifyReply } from 'fastify'
import { makeOTPUseCase } from '@/factories/otp.factory'
import { makeFindUserUseCase } from '@/factories/user.factory'
import { z } from 'zod'
import { json } from '@/lib/json'
import validatePhoneNumber, { extractCallingCode } from '@/utils/validate-phone-number';

export async function sendOTP(request: FastifyRequest, reply: FastifyReply) {
  try {
    const schema = z.object({
      phone: z.string().refine((phone) => validatePhoneNumber(phone, extractCallingCode(phone)), 'Invalid phone number format')
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
      phone: z.string().refine((phone) => validatePhoneNumber(phone, extractCallingCode(phone)), 'Invalid phone number format')
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

export async function verifyOTP(request: FastifyRequest, reply: FastifyReply) {
  try {
    const schema = z.object({
      phone: z.string().refine((phone) => validatePhoneNumber(phone, extractCallingCode(phone)), 'Invalid phone number format'),
      otp: z.string().length(4).regex(/^\d+$/, 'OTP must be 4 digits')
    })

    const { phone, otp } = schema.parse(request.body)

    const result = await makeOTPUseCase().verify(phone, otp)

    return reply.status(200).send(json({
      success: true,
      code: 'OTP_VERIFIED',
      message: 'Verification code verified successfully',
      phone: result.phone
    }))
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return reply.status(400).send(json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Invalid input format',
        errors: error.errors
      }))
    }

    return reply.status(500).send(json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Failed to verify OTP'
    }))
  }
}

export const sendOTPOpts = {
  schema: {
    tags: ['auth'],
    description: 'Send OTP verification code',
    body: {
      type: 'object',
      required: ['phone'],
      properties: {
        phone: {
          type: 'string',
          description: 'Phone number in international format (e.g., +1234567890)'
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          code: { type: 'string' },
          message: { type: 'string' },
          isNewPhone: { type: 'boolean' }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          code: { type: 'string' },
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object'
            }
          }
        }
      },
      500: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          code: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
}

export const verifyOTPOpts = {
  schema: {
    tags: ['auth'],
    description: 'Verify OTP code',
    body: {
      type: 'object',
      required: ['phone', 'otp'],
      properties: {
        phone: {
          type: 'string',
          description: 'Phone number in international format (e.g., +1234567890)'
        },
        otp: {
          type: 'string',
          pattern: '^[0-9]{4}$',
          description: '4-digit OTP code'
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          code: { type: 'string' },
          message: { type: 'string' },
          phone: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          code: { type: 'string' },
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object'
            }
          }
        }
      },
      500: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          code: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
}