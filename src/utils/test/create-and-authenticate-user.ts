import { FastifyInstance } from 'fastify'
import request from 'supertest'
import { fakeUserRegisterInput } from './fake-data'

interface AuthResponse {
  token: string
  refreshToken: string
}

export async function createAndAuthenticateUser(
  app: FastifyInstance,
  isAdmin = false
): Promise<AuthResponse> {
  const userData = {
    ...fakeUserRegisterInput,
    role: isAdmin ? 'ADMIN' : 'CUSTOMER'
  }

  // Register the user
  await request(app.server)
    .post('/auth/register')
    .send(userData)

  // Login to get the tokens
  const authResponse = await request(app.server)
    .post('/auth/login')
    .send({
      username_or_email: userData.email,
      password: userData.password
    })

  const { accessToken: token, refreshToken } = authResponse.body

  return {
    token,
    refreshToken
  }
}
