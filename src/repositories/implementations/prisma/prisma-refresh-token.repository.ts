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
          userId: data.userId,
          expiresAt: data.expiresAt,
        },
      })
    } catch (error) {
      if (error.code === 'P2002') {
        const newRandomSuffix = randomBytes(16).toString('hex')
        const newUniqueToken = `${jwtToken}.${newRandomSuffix}`

        return await prisma.refreshToken.create({
          data: {
            token: newUniqueToken,
            userId: data.userId,
            expiresAt: data.expiresAt,
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
      data: { revokedAt: new Date() },
    })
  }

  async deleteExpired(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
  }

  async revokeUserTokens(userId: number): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      data: { revokedAt: new Date() }
    })
  }
}
