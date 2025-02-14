import { app } from '@/app'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

describe('Logout (e2e)', () => {
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

  it('should successfully logout a user', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({
      message: 'Logged out successfully'
    })

    // Verify that refresh tokens were revoked
    const refreshTokens = await prisma.refreshToken.findMany({
      where: {
        revoked_at: null
      }
    })
    expect(refreshTokens).toHaveLength(0)
  })

  it('should not allow logout without authentication', async () => {
    const response = await request(app.server)
      .post('/auth/logout')
      .send()

    expect(response.statusCode).toEqual(401)
  })

  it('should not allow logout with invalid token', async () => {
    const response = await request(app.server)
      .post('/auth/logout')
      .set('Authorization', 'Bearer invalid-token')
      .send()

    expect(response.statusCode).toEqual(401)
  })
})
