import { FastifyInstance } from 'fastify'
import register from '@/http/controllers/user/auth/register'
import login from '@/http/controllers/user/auth/login'
import refresh from '@/http/controllers/user/auth/refresh'
import logout from '@/http/controllers/user/auth/logout'
import getProfile from '@/http/controllers/user/profile/get-profile'
import updateProfile from '@/http/controllers/user/profile/update-profile'
import updatePassword from '@/http/controllers/user/profile/update-password'
import updatePin from '@/http/controllers/user/profile/update-pin'
import listUsers from './list-users'
import getUser from './get-user'
import { sendOTP } from './auth/otp'
import { resendOTP } from './auth/otp'
// import updateProfilePhoto from './profile/update-profile-photo'

export async function userRoutes(app: FastifyInstance) {
  app.post('/auth/register', register)
  app.post('/auth/login', login)
  app.post('/auth/refresh', refresh)
  app.post('/auth/otp', sendOTP)
  app.post('/auth/otp/resend', resendOTP)
  app.post('/auth/logout', { onRequest: [app.authenticate] }, logout)
  app.get('/auth/me', { onRequest: [app.authenticate] }, getProfile)
  app.put('/user/profile', { onRequest: [app.authenticate] }, updateProfile)
  app.put('/user/profile/change-password', { onRequest: [app.authenticate] }, updatePassword)
  app.put('/user/profile/change-pin', { onRequest: [app.authenticate] }, updatePin)
  // app.patch(
  //   '/auth/profile/update-avatar-photo',
  //   { onRequest: [app.authenticate] },
  //   updateProfilePhoto,
  // )

  app.get('/users', { onRequest: [app.authenticate, app.isAdmin] }, listUsers)
  app.get('/users/:id', { onRequest: [app.authenticate, app.isAdmin] }, getUser)
}
