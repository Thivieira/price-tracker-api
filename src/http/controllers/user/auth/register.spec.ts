import { app } from '@/app'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { fakeUserRegisterInput, createFakeUserRegisterInput } from '@/utils/test/fake-data'

describe('Register (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.refreshToken.deleteMany()
    await prisma.user.deleteMany()
  })

  it('should be able to register a new user', async () => {
    const userData = createFakeUserRegisterInput()

    const response = await request(app.server)
      .post('/auth/register')
      .send(userData)

    expect(response.statusCode).toEqual(201)
    expect(response.body).toHaveProperty('message', 'User registered successfully')
    expect(response.body).toHaveProperty('accessToken')
    expect(response.body).toHaveProperty('refreshToken')
  })

  it('should not register with existing email', async () => {
    // First registration
    await request(app.server)
      .post('/auth/register')
      .send(fakeUserRegisterInput)

    // Attempt to register with same email
    const response = await request(app.server)
      .post('/auth/register')
      .send(fakeUserRegisterInput)

    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({
      error: 'Email already in use'
    })
  })

  it('should not register with existing username', async () => {
    // First registration
    await request(app.server)
      .post('/auth/register')
      .send(fakeUserRegisterInput)

    // Attempt to register with same username but different email
    const response = await request(app.server)
      .post('/auth/register')
      .send({
        ...fakeUserRegisterInput,
        email: 'different@example.com'
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({
      error: 'Username already in use'
    })
  })

  it('should not register with mismatched passwords', async () => {
    const response = await request(app.server)
      .post('/auth/register')
      .send({
        ...fakeUserRegisterInput,
        password_confirmation: 'different123'
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({
      error: 'Passwords do not match'
    })
  })

  it('should validate required fields', async () => {
    const response = await request(app.server)
      .post('/auth/register')
      .send({
        email: 'invalid-email',
        password: '123'
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toHaveProperty('message', 'Validation error.')
  })

  it('should not register with existing phone number', async () => {
    // First registration
    await request(app.server)
      .post('/auth/register')
      .send(fakeUserRegisterInput)

    // Attempt to register with same phone number but different email and username
    const response = await request(app.server)
      .post('/auth/register')
      .send({
        ...fakeUserRegisterInput,
        email: 'different@example.com',
        username: 'differentuser'
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({
      error: 'Phone number already in use'
    })
  })
})
