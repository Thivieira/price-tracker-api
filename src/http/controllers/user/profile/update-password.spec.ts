import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { fakeUserRegisterInput } from '@/utils/test/fake-data'
import bcrypt from 'bcrypt'

describe('Update Password (e2e)', () => {
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

  it('should be able to update user password', async () => {
    const { token } = await createAndAuthenticateUser(app)

    await request(app.server)
      .put('/user/profile/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_password: fakeUserRegisterInput.password,
        new_password: 'newpassword123',
        confirm_new_password: 'newpassword123'
      })

    const user = await prisma.user.findFirst({
      where: {
        email: fakeUserRegisterInput.email
      }
    })

    if (!user) {
      throw new Error('User not found after password update')
    }

    const isNewPasswordValid = await bcrypt.compare('newpassword123', user.password)

    expect(isNewPasswordValid).toBe(true)
  })

  it('should not update password without authentication', async () => {
    const response = await request(app.server)
      .put('/user/profile/change-password')
      .send({
        current_password: 'oldpassword123',
        new_password: 'newpassword123',
        confirm_new_password: 'newpassword123'
      })

    expect(response.statusCode).toEqual(401)
  })

  it('should not update password with incorrect current password', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .put('/user/profile/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_password: 'wrongpassword',
        new_password: 'newpassword123',
        confirm_new_password: 'newpassword123'
      })

    expect(response.statusCode).toEqual(500)
    expect(response.body).toEqual({
      success: false,
      message: 'Failed to update password'
    })
  })

  it('should not update password when passwords do not match', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .put('/user/profile/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_password: fakeUserRegisterInput.password,
        new_password: 'newpassword123',
        confirm_new_password: 'differentpassword123'
      })

    expect(response.statusCode).toEqual(500)
    expect(response.body).toEqual({
      success: false,
      message: 'Failed to update password'
    })
  })

  it('should validate password minimum length', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .put('/user/profile/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_password: fakeUserRegisterInput.password,
        new_password: '12345',
        confirm_new_password: '12345'
      })

    expect(response.statusCode).toEqual(500)
    expect(response.body).toEqual({
      success: false,
      message: 'Failed to update password'
    })
  })
})
