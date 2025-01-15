import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { fakeUserRegisterInput } from '@/utils/test/fake-data'

describe('Update Profile (e2e)', () => {
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

  it('should be able to update user profile', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const updateData = {
      first_name: 'Updated First Name',
      last_name: 'Updated Last Name',
      email: 'updated@example.com',
      phone: '9876543210',
      street_address: '456 New Street',
      city: 'New City',
      region: 'NY',
      zip_code: '54321'
    }

    const response = await request(app.server)
      .put('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(updateData)

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({
      success: true,
      message: 'Profile updated successfully'
    })

    // Verify the updates in database
    const updatedUser = await prisma.user.findFirst({
      where: {
        email: updateData.email
      }
    })

    expect(updatedUser).toBeTruthy()
    expect(updatedUser).toMatchObject(updateData)
  })

  it('should not update profile without authentication', async () => {
    const response = await request(app.server)
      .put('/user/profile')
      .send({
        first_name: 'Updated Name'
      })

    expect(response.statusCode).toEqual(401)
  })

  it('should not update profile with invalid token', async () => {
    const response = await request(app.server)
      .put('/user/profile')
      .set('Authorization', 'Bearer invalid-token')
      .send({
        first_name: 'Updated Name'
      })

    expect(response.statusCode).toEqual(401)
  })

  it('should validate required fields', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const response = await request(app.server)
      .put('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'invalid-email',
        zip_code: '12345'
      })

    console.log(response.body)

    expect(response.statusCode).toEqual(400)
    expect(response.body).toHaveProperty('message', 'Validation error.')
  })

  it('should not update with existing email from another user', async () => {
    // Create first user
    const { token } = await createAndAuthenticateUser(app)

    // Create second user with different email
    await request(app.server)
      .post('/auth/register')
      .send({
        ...fakeUserRegisterInput,
        phone: '123456789008',
        email: 'another@example.com',
        username: 'anotheruser'
      })

    // Try to update first user's email to second user's email
    const response = await request(app.server)
      .put('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'another@example.com'
      })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({
      success: false,
      message: 'Email already in use'
    })
  })
})
