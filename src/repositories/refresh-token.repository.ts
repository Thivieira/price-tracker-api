import { RefreshToken } from '@prisma/client'

export interface RefreshTokenRepository {
  create(data: { userId: number; expiresAt: Date }): Promise<RefreshToken>
  findByToken(token: string): Promise<RefreshToken | null>
  revokeToken(token: string): Promise<void>
  revokeUserTokens(userId: number): Promise<void>
  deleteExpired(): Promise<void>
}
