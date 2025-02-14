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
  constructor(private refreshTokenRepository: RefreshTokenRepository) { }

  async execute(token: string): Promise<RefreshTokenResponse> {
    const refreshToken = await this.refreshTokenRepository.findByToken(token)

    if (!refreshToken) {
      throw new Error('Refresh token not found')
    }

    if (refreshToken.revoked_at) {
      throw new Error('Refresh token has been revoked')
    }

    if (dayjs(refreshToken.expires_at).isBefore(dayjs())) {
      throw new Error('Refresh token has expired')
    }

    await this.refreshTokenRepository.revokeToken(token)

    const accessToken = app.jwt.sign(
      { sub: refreshToken.user_id },
      { key: env.ACCESS_TOKEN_SECRET, expiresIn: '15m' },
    )

    const newRefreshToken = await this.refreshTokenRepository.create({
      userId: refreshToken.user_id,
      expires_at: dayjs().add(7, 'days').toDate(),
    })

    return {
      accessToken,
      refreshToken: newRefreshToken,
    }
  }

  async createRefreshToken(userId: number) {
    const newRefreshToken = await this.refreshTokenRepository.create({
      userId: userId,
      expires_at: dayjs().add(7, 'days').toDate(),
    })

    return newRefreshToken
  }
}
