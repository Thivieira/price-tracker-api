import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Get Profile (e2e)', () => {
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

  it('should be able to get user profile', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const profileResponse = await request(app.server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(profileResponse.statusCode).toEqual(200)
    expect(profileResponse.body.user).toEqual(
      expect.objectContaining({
        email: expect.any(String),
        first_name: expect.any(String),
        last_name: expect.any(String),
        username: expect.any(String)
      })
    )
    // Ensure sensitive fields are not returned
    expect(profileResponse.body.user).not.toHaveProperty('password')
    expect(profileResponse.body.user).not.toHaveProperty('hashed_pin')
    expect(profileResponse.body.user).not.toHaveProperty('role')
  })

  it('should not get profile without authentication', async () => {
    const response = await request(app.server)
      .get('/auth/me')
      .send()

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual({
      error: 'Unauthorized'
    })
  })

  it('should not get profile with invalid token', async () => {
    const response = await request(app.server)
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .send()

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual({
      error: 'Unauthorized'
    })
  })
}) 