import { RefreshToken } from '@prisma/client'
import { env } from '@/env'
import dayjs from '@/lib/dayjs'
import { app } from '@/app'
import { RefreshTokenRepository } from '@/repositories/refresh-token.repository'

interface RefreshTokenResponse {
  accessToken: string
  refreshToken: RefreshToken
}

export class RefreshTokenUseCase {
  constructor(private refreshTokenRepository: RefreshTokenRepository) {}

  async execute(token: string): Promise<RefreshTokenResponse> {
    const refreshToken = await this.refreshTokenRepository.findByToken(token)

    if (!refreshToken) {
      throw new Error('Refresh token not found')
    }

    if (refreshToken.revokedAt) {
      throw new Error('Refresh token has been revoked')
    }

    if (dayjs(refreshToken.expiresAt).isBefore(dayjs())) {
      throw new Error('Refresh token has expired')
    }

    await this.refreshTokenRepository.revokeToken(token)

    const accessToken = app.jwt.sign(
      { sub: refreshToken.userId },
      { key: env.ACCESS_TOKEN_SECRET, expiresIn: '15m' },
    )

    const newRefreshToken = await this.refreshTokenRepository.create({
      userId: refreshToken.userId,
      expiresAt: dayjs().add(7, 'days').toDate(),
    })

    return {
      accessToken,
      refreshToken: newRefreshToken,
    }
  }

  async createRefreshToken(userId: number) {
    const newRefreshToken = await this.refreshTokenRepository.create({
      userId: userId,
      expiresAt: dayjs().add(7, 'days').toDate(),
    })

    return newRefreshToken
  }
}
