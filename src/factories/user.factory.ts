import { makeRefreshTokenRepository } from './refresh-token.factory';
import { PrismaUserRepository } from '@/repositories/implementations/prisma/prisma-user.repository'
import { LoginUserUseCase } from '@/use-cases/auth/login'
import { GetProfileUseCase } from '@/use-cases/auth/profile'
import { CreateUserUseCase } from '@/use-cases/user/create-user'
import { FindUserUseCase } from '@/use-cases/user/find-user'
import { ListUsersUseCase } from '@/use-cases/user/list-users';
import { UpdateUserProfileUseCase } from '@/use-cases/user/update-user'

export const makeUserRepository = () => {
  return new PrismaUserRepository()
}

export const makeCreateUserUseCase = () => {
  const userRepository = makeUserRepository()
  return new CreateUserUseCase(userRepository)
}

export const makeFindUserUseCase = () => {
  const userRepository = makeUserRepository()
  return new FindUserUseCase(userRepository)
}

export const makeLoginUseCase = () => {
  const userRepository = makeUserRepository()
  const refreshTokenRepository = makeRefreshTokenRepository()
  return new LoginUserUseCase(userRepository, refreshTokenRepository)
}

export function makeGetProfileUseCase() {
  const userRepository = makeUserRepository()
  return new GetProfileUseCase(userRepository)
}

export function makeUpdateUserProfileUseCase() {
  const userRepository = makeUserRepository()
  return new UpdateUserProfileUseCase(userRepository)
}

export function makeListUsersUseCase() {
  const userRepository = makeUserRepository()
  return new ListUsersUseCase(userRepository)
}