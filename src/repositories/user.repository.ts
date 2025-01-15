import { Prisma, User } from '@prisma/client'
import { UpdateProfileRequest } from '@/schemas/user.schema'

export interface UserRepository {
  createUser(userData: Partial<User>): Promise<User>
  updateUser(userId: number, userData: UpdateProfileRequest): Promise<void>
  findUsers(params: Prisma.UserFindManyArgs): Promise<User[]>
  countUsers(params: Prisma.UserCountArgs): Promise<number>
  findUserByEmail(email: string): Promise<User | null>
  findUserById(id: number): Promise<User | null>
  findUserByUsername(username: string): Promise<User | null>
  findUserByPhone(phone: string): Promise<User | null>
  updatePassword(userId: number, password: string): Promise<void>
  updatePin(userId: number, pin: string): Promise<void>
}
