import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { fakeUserRegisterInput } from '@/utils/test/fake-data'
import bcrypt from 'bcryptjs'

describe('Update PIN (e2e)', () => {
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

  it('should be able to update user PIN', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .put('/user/profile/change-pin')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_pin: fakeUserRegisterInput.raw_pin,
        new_pin: '5678',
        confirm_new_pin: '5678'
      })

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({
      success: true,
      message: 'PIN updated successfully'
    })

    const user = await prisma.user.findFirst({
      where: {
        email: fakeUserRegisterInput.email
      }
    })

    if (!user) {
      throw new Error('User not found after PIN update')
    }

    const isNewPinValid = await bcrypt.compare('5678', user.hashed_pin)
    expect(isNewPinValid).toBe(true)
  })

  it('should not update PIN without authentication', async () => {
    const response = await request(app.server)
      .put('/user/profile/change-pin')
      .send({
        current_pin: '1234',
        new_pin: '5678',
        confirm_new_pin: '5678'
      })

    expect(response.statusCode).toEqual(401)
  })

  it('should not update PIN with incorrect current PIN', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .put('/user/profile/change-pin')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_pin: '9999',
        new_pin: '5678',
        confirm_new_pin: '5678'
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({
      success: false,
      message: 'Current PIN is incorrect'
    })
  })

  it('should not update PIN when PINs do not match', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .put('/user/profile/change-pin')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_pin: fakeUserRegisterInput.raw_pin,
        new_pin: '5678',
        confirm_new_pin: '5679'
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({
      success: false,
      message: 'Validation error'
    })
  })

  it('should validate PIN format (4 digits only)', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .put('/user/profile/change-pin')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_pin: fakeUserRegisterInput.raw_pin,
        new_pin: 'abcd',
        confirm_new_pin: 'abcd'
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({
      success: false,
      message: 'Validation error'
    })
  })

  it('should validate PIN length', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .put('/user/profile/change-pin')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_pin: fakeUserRegisterInput.raw_pin,
        new_pin: '12345',
        confirm_new_pin: '12345'
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({
      success: false,
      message: 'Validation error'
    })
  })
})
