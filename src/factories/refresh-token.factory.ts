import { PrismaRefreshTokenRepository } from '@/repositories/implementations/prisma/prisma-refresh-token.repository'
import { RefreshTokenUseCase } from '@/use-cases/auth/refresh-token'

export function makeRefreshTokenRepository() {
  return new PrismaRefreshTokenRepository()
}

export function makeRefreshTokenUseCase() {
  const refreshTokenRepository = makeRefreshTokenRepository()
  return new RefreshTokenUseCase(refreshTokenRepository)
}
