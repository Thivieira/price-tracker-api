import { PrismaRefreshTokenRepository } from '@/repositories/implementations/prisma/prisma-refresh-token.repository'

export class TokenCleanupService {
  constructor(private refreshTokenRepository: PrismaRefreshTokenRepository) { }

  async cleanupExpiredTokens() {
    try {
      await this.refreshTokenRepository.deleteExpired()
    } catch (error) {
      console.error('Failed to cleanup expired tokens:', error)
    }
  }

  async cleanupUserTokens(userId: number) {
    try {
      await this.refreshTokenRepository.revokeUserTokens(userId)
    } catch (error) {
      console.error('Failed to cleanup user tokens:', error)
    }
  }
} 