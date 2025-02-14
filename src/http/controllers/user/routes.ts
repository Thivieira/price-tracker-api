import { FastifyInstance } from 'fastify'
import register from '@/http/controllers/user/auth/register'
import login from '@/http/controllers/user/auth/login'
import refresh from '@/http/controllers/user/auth/refresh'
import logout, { logoutOpts } from '@/http/controllers/user/auth/logout'
import verifyPin from '@/http/controllers/user/auth/verify-pin'
import setupPin from '@/http/controllers/user/auth/setup-pin'
import getProfile, { getProfileOpts } from '@/http/controllers/user/profile/get-profile'
import updateProfile from '@/http/controllers/user/profile/update-profile'
import updatePin, { updatePinOpts, UpdatePinBody } from '@/http/controllers/user/profile/update-pin'
import listUsers from './list-users'
import getUser from './get-user'
import { sendOTP, resendOTP, verifyOTP } from './auth/otp'
import updateUser from './update-user'
import deleteUser from './delete-user'
import restoreUser from './restore-user'
import permanentlyDeleteUser from './permanently-delete-user'
import { loginOpts } from './auth/login'
import { registerOpts } from './auth/register'
import { refreshOpts } from './auth/refresh'
import { verifyPinOpts } from './auth/verify-pin'
import { sendOTPOpts, verifyOTPOpts } from './auth/otp'
import { successResponseSchema, genericErrorSchema } from '@/schemas/route-schemas'
import { updateProfileOpts } from '@/http/controllers/user/profile/update-profile'
import { setupPinOpts } from './auth/setup-pin'

export async function userRoutes(app: FastifyInstance) {
  app.post('/auth/register', registerOpts, register)
  app.post('/auth/login', loginOpts, login)
  app.post('/auth/refresh', refreshOpts, refresh)
  app.post('/auth/otp', sendOTPOpts, sendOTP)
  app.post('/auth/otp/resend', resendOTP)
  app.post('/auth/otp/verify', verifyOTPOpts, verifyOTP)
  app.post('/auth/logout', logoutOpts, logout)
  app.get('/auth/me', {
    ...getProfileOpts,
    onRequest: [app.authenticate]
  }, getProfile)
  app.post('/auth/verify-pin', {
    ...verifyPinOpts,
    onRequest: [app.authenticate]
  }, verifyPin)
  app.post('/auth/setup-pin', {
    ...setupPinOpts,
    onRequest: [app.authenticate]
  }, setupPin)
  app.patch('/profile', {
    ...updateProfileOpts,
    onRequest: [app.authenticate]
  }, updateProfile)
  app.patch<{ Body: UpdatePinBody }>('/profile/pin', {
    ...updatePinOpts,
    onRequest: [app.authenticate]
  }, updatePin)

  app.get('/users', {
    schema: {
      tags: ['users'],
      description: 'List all users (admin only)',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  username: { type: 'string' },
                  phone: { type: 'string' },
                  role: { type: 'string' },
                  created_at: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        401: genericErrorSchema,
        403: genericErrorSchema
      }
    },
    onRequest: [app.authenticate, app.isAdmin]
  }, listUsers)

  app.get('/users/:id', { onRequest: [app.authenticate, app.isAdmin] }, getUser)
  app.put('/users/:id', { onRequest: [app.authenticate, app.isAdmin] }, updateUser)
  app.delete('/users/:id', {
    schema: {
      tags: ['users'],
      description: 'Soft delete a user (admin only)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' }
        }
      },
      response: {
        200: successResponseSchema,
        401: genericErrorSchema,
        403: genericErrorSchema,
        404: genericErrorSchema
      }
    },
    onRequest: [app.authenticate, app.isAdmin]
  }, deleteUser)

  app.post('/users/:id/restore', {
    schema: {
      tags: ['users'],
      description: 'Restore a soft-deleted user (admin only)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' }
        }
      },
      response: {
        200: successResponseSchema,
        401: genericErrorSchema,
        403: genericErrorSchema,
        404: genericErrorSchema
      }
    },
    onRequest: [app.authenticate, app.isAdmin]
  }, restoreUser)

  app.delete('/users/:id/permanently', { onRequest: [app.authenticate, app.isAdmin] }, permanentlyDeleteUser)
}
