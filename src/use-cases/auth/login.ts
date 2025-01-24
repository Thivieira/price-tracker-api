import { UserRepository } from '@/repositories/user.repository'
import { app } from '@/app'
import { env } from '@/env'
import { makeRefreshTokenUseCase } from '@/factories/refresh-token.factory'
import { UserNotFoundException } from '@/exceptions/user.exceptions'
import { RefreshTokenRepository } from '@/repositories/refresh-token.repository'

interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export class LoginUserUseCase {
  constructor(private readonly userRepository: UserRepository, private readonly refreshTokenRepository: RefreshTokenRepository) { }

  async execute(id: number): Promise<LoginResponse> {
    const user = await this.userRepository.findUserById(id)

    if (!user) {
      throw new UserNotFoundException()
    }

    await this.refreshTokenRepository.revokeUserTokens(user.id)

    const userPayload = { sub: user.id }

    const accessToken = app.jwt.sign(userPayload, {
      key: env.ACCESS_TOKEN_SECRET,
      expiresIn: '15m',
    })

    const refreshToken = await makeRefreshTokenUseCase().createRefreshToken(user.id)

    return { accessToken, refreshToken: refreshToken.token }
  }
}
