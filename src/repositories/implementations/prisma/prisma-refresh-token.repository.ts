import { prisma } from '@/lib/prisma'
import { RefreshTokenRepository } from '@/repositories/refresh-token.repository'
import { RefreshToken } from '@prisma/client'
import { app } from '@/app'
import { env } from '@/env'
import { randomBytes } from 'crypto'

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async create(data: { userId: number; expiresAt: Date }): Promise<RefreshToken> {
    const jwtToken = app.jwt.sign(
      { sub: data.userId },
      { key: env.REFRESH_TOKEN_SECRET, expiresIn: '7d' },
    )

    const randomSuffix = randomBytes(16).toString('hex')
    const uniqueToken = `${jwtToken}.${randomSuffix}`

    try {
      return await prisma.refreshToken.create({
        data: {
          token: uniqueToken,
          user_id: data.userId,
          expires_at: data.expiresAt,
        },
      })
    } catch (error) {
      if (error.code === 'P2002') {
        const newRandomSuffix = randomBytes(16).toString('hex')
        const newUniqueToken = `${jwtToken}.${newRandomSuffix}`

        return await prisma.refreshToken.create({
          data: {
            token: newUniqueToken,
            user_id: data.userId,
            expires_at: data.expiresAt,
          },
        })
      }
      throw error
    }
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    })
  }

  async revokeToken(token: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { token },
      data: { revoked_at: new Date() },
    })
  }

  async deleteExpired(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    })
  }

  async revokeUserTokens(userId: number): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        user_id: userId,
        revoked_at: null,
        expires_at: {
          gt: new Date()
        }
      },
      data: { revoked_at: new Date() }
    })
  }
}
