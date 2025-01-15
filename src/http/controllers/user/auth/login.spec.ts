import { app } from '@/app'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { fakeUserRegisterInput, fakeUserLoginInput } from '@/utils/test/fake-data'

describe('Login (e2e)', () => {
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

  it('should be able to authenticate with email', async () => {
    // Create test user
    await request(app.server).post('/auth/register').send(fakeUserRegisterInput)

    const loginResponse = await request(app.server).post('/auth/login').send(fakeUserLoginInput.withEmail)

    expect(loginResponse.statusCode).toEqual(200)
    expect(loginResponse.body).toHaveProperty('accessToken')
    expect(loginResponse.body).toHaveProperty('refreshToken')
  })

  it('should be able to authenticate with username', async () => {
    // Create test user with username
    await request(app.server).post('/auth/register').send(fakeUserRegisterInput)

    const loginResponse = await request(app.server).post('/auth/login').send(fakeUserLoginInput.withUsername)

    expect(loginResponse.statusCode).toEqual(200)
    expect(loginResponse.body).toHaveProperty('accessToken')
    expect(loginResponse.body).toHaveProperty('refreshToken')
  })

  it('should not authenticate with wrong password', async () => {
    // Create test user
    await request(app.server).post('/auth/register').send(fakeUserRegisterInput)

    const loginResponse = await request(app.server).post('/auth/login').send({
      username_or_email: fakeUserRegisterInput.email,
      password: 'wrongpassword'
    })

    expect(loginResponse.statusCode).toEqual(401)
    expect(loginResponse.body).toEqual({
      error: 'Unauthorized'
    })
  })

  it('should not authenticate with non-existent user', async () => {
    const loginResponse = await request(app.server).post('/auth/login').send({
      username_or_email: 'nonexistent@example.com',
      password: 'password123'
    })

    expect(loginResponse.statusCode).toEqual(401)
    expect(loginResponse.body).toEqual({
      error: 'Unauthorized'
    })
  })
})
