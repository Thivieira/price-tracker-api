import { describe, afterEach, beforeAll, expect, it, beforeEach, afterAll, vi } from "vitest"

import { app } from "@/app"
import { prisma } from "@/lib/prisma"
import request from "supertest"
import { fakeUserRegisterInputWithValidPhone } from "@/utils/test/fake-data"

describe('Resend OTP (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
    vi.useFakeTimers()
  })

  afterAll(async () => {
    await app.close()
    vi.useRealTimers()
  })

  beforeEach(() => {
    vi.setSystemTime(new Date())
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should enforce cooldown period between OTP requests', async () => {
    const phone = '+15005550006' // Twilio's test number that passes all validation

    // First OTP request
    const firstResponse = await request(app.server)
      .post('/auth/otp')
      .send({ phone })

    expect(firstResponse.statusCode).toBe(200)

    // Immediate second request - should fail with cooldown message
    const immediateResponse = await request(app.server)
      .post('/auth/otp')
      .send({ phone })

    expect(immediateResponse.statusCode).toBe(400)
    expect(immediateResponse.body.message).toContain('Please wait')

    // Advance time by 4 minutes (past the 3-minute cooldown)
    vi.advanceTimersByTime(4 * 60 * 1000)
    await vi.runAllTimersAsync()

    // Third request after cooldown - should succeed
    const afterCooldownResponse = await request(app.server)
      .post('/auth/otp')
      .send({ phone })

    expect(afterCooldownResponse.statusCode).toBe(200)
  })

  it('should handle resend OTP with proper timing', async () => {
    const phone = '+15005550006' // Twilio's test number that passes all validation

    // Initial request
    const initialResponse = await request(app.server)
      .post('/auth/otp')
      .send({ phone })

    expect(initialResponse.statusCode).toBe(200)

    // Immediate resend - should fail
    const immediateResend = await request(app.server)
      .post('/auth/otp/resend')
      .send({ phone })

    expect(immediateResend.statusCode).toBe(500)
    expect(immediateResend.body.message).toContain('Please wait')

    // Advance time by 2 minutes
    vi.advanceTimersByTime(2 * 60 * 1000)
    await vi.runAllTimersAsync()

    // Resend after cooldown - should succeed
    const afterCooldownResend = await request(app.server)
      .post('/auth/otp/resend')
      .send({ phone })

    expect(afterCooldownResend.statusCode).toBe(200)
  })
})

describe('OTP Verification (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.oTPVerification.deleteMany()
    await prisma.user.deleteMany()
  })

  it('should validate OTP format', async () => {
    // First register a user
    await request(app.server)
      .post('/auth/register')
      .send(fakeUserRegisterInputWithValidPhone)

    const response = await request(app.server)
      .post('/auth/otp/verify')
      .send({
        phone: fakeUserRegisterInputWithValidPhone.phone,
        otp: 'abcd' // Invalid format - should be numbers only
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({
      success: false,
      message: 'Invalid OTP format'
    })
  })

  it('should handle expired OTP', async () => {
    // First register a user
    await request(app.server)
      .post('/auth/register')
      .send(fakeUserRegisterInputWithValidPhone)

    // Create an expired OTP record
    await prisma.oTPVerification.create({
      data: {
        phone: fakeUserRegisterInputWithValidPhone.phone,
        hashed_otp: 'some-hashed-value',
        expires_at: new Date(Date.now() - 1000), // Set to past date
        attempts: 0
      }
    })

    const response = await request(app.server)
      .post('/auth/otp/verify')
      .send({
        phone: fakeUserRegisterInputWithValidPhone.phone,
        otp: '1234'
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({
      success: false,
      message: 'OTP expired or not found'
    })
  })

  it('should handle maximum verification attempts', async () => {
    // First register a user
    await request(app.server)
      .post('/auth/register')
      .send(fakeUserRegisterInputWithValidPhone)

    // Create an OTP record with max attempts
    await prisma.oTPVerification.create({
      data: {
        phone: fakeUserRegisterInputWithValidPhone.phone,
        hashed_otp: 'some-hashed-value',
        expires_at: new Date(Date.now() + 600000),
        attempts: 3
      }
    })

    const response = await request(app.server)
      .post('/auth/otp/verify')
      .send({
        phone: fakeUserRegisterInputWithValidPhone.phone,
        otp: '1234'
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({
      success: false,
      message: 'Maximum verification attempts exceeded'
    })
  })

  it('should increment attempts counter on failed verification', async () => {
    // First register a user
    await request(app.server)
      .post('/auth/register')
      .send(fakeUserRegisterInputWithValidPhone)

    // Request initial OTP
    await request(app.server)
      .post('/auth/otp')
      .send({
        phone: fakeUserRegisterInputWithValidPhone.phone
      })

    // Attempt verification with wrong OTP
    await request(app.server)
      .post('/auth/otp/verify')
      .send({
        phone: fakeUserRegisterInputWithValidPhone.phone,
        otp: '9999'
      })

    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        phone: fakeUserRegisterInputWithValidPhone.phone
      }
    })

    expect(otpRecord?.attempts).toBe(1)
  })

  it('should handle invalid phone number format', async () => {
    const response = await request(app.server)
      .post('/auth/otp')
      .send({
        phone: '+15005550001' // Twilio's test number for invalid format
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({
      success: false,
      message: 'Invalid phone number format'
    })
  })
})
