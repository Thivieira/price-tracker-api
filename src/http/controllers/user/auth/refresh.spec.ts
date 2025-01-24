import { app } from '@/app'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { fakeUserRegisterInput } from '@/utils/test/fake-data'

describe('Refresh Token (e2e)', () => {
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

  it('should be able to refresh token', async () => {
    // First register a user
    await request(app.server)
      .post('/auth/register')
      .send(fakeUserRegisterInput)

    // Then login to get initial tokens
    const loginResponse = await request(app.server)
      .post('/auth/login')
      .send({
        username_or_email: fakeUserRegisterInput.email,
        password: fakeUserRegisterInput.password,
      })

    expect(loginResponse.statusCode).toEqual(200)
    expect(loginResponse.body).toHaveProperty('refreshToken')

    // Try to refresh the token
    const refreshResponse = await request(app.server)
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${loginResponse.body.refreshToken}`)
      .send()

    expect(refreshResponse.statusCode).toEqual(200)
    expect(refreshResponse.body).toHaveProperty('accessToken')
    expect(refreshResponse.body).toHaveProperty('refreshToken')
    expect(refreshResponse.body.refreshToken).not.toEqual(loginResponse.body.refreshToken)
  })

  it('should not refresh with invalid token', async () => {
    const response = await request(app.server)
      .post('/auth/refresh')
      .set('Authorization', 'Bearer invalid-token')
      .send()

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual({
      error: 'Refresh token not found'
    })
  })

  it('should not refresh with expired token', async () => {
    // First register and login
    await request(app.server)
      .post('/auth/register')
      .send(fakeUserRegisterInput)

    const loginResponse = await request(app.server)
      .post('/auth/login')
      .send({
        username_or_email: fakeUserRegisterInput.email,
        password: fakeUserRegisterInput.password,
      })

    // Manually expire the token in the database
    await prisma.refreshToken.updateMany({
      where: {
        token: loginResponse.body.refreshToken
      },
      data: {
        expiresAt: new Date(Date.now() - 1000) // Set to past date
      }
    })

    const refreshResponse = await request(app.server)
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${loginResponse.body.refreshToken}`)
      .send()

    expect(refreshResponse.statusCode).toEqual(401)
    expect(refreshResponse.body).toEqual({
      error: 'Refresh token has expired'
    })
  })

  it('should not refresh with revoked token', async () => {
    // First register and login
    await request(app.server)
      .post('/auth/register')
      .send(fakeUserRegisterInput)

    const loginResponse = await request(app.server)
      .post('/auth/login')
      .send({
        username_or_email: fakeUserRegisterInput.email,
        password: fakeUserRegisterInput.password,
      })

    // Manually revoke the token
    await prisma.refreshToken.updateMany({
      where: {
        token: loginResponse.body.refreshToken
      },
      data: {
        revokedAt: new Date()
      }
    })

    const refreshResponse = await request(app.server)
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${loginResponse.body.refreshToken}`)
      .send()

    expect(refreshResponse.statusCode).toEqual(401)
    expect(refreshResponse.body).toEqual({
      error: 'Refresh token has been revoked'
    })
  })
})
