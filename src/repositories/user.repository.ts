import { Prisma, User } from '@prisma/client'
import { UpdateProfileRequest } from '@/schemas/user.schema'

export interface UserRepository {
  createUser(userData: Omit<Prisma.UserCreateInput, 'created_at' | 'updated_at'>): Promise<User>
  updateUser(userId: number, userData: UpdateProfileRequest): Promise<void>
  findUsers(params: Prisma.UserFindManyArgs): Promise<User[]>
  countUsers(params: Prisma.UserCountArgs): Promise<number>
  findUserByEmail(email: string): Promise<User | null>
  findUserById(id: number): Promise<User | null>
  findUserByUsername(username: string): Promise<User | null>
  findUserByPhone(phone: string): Promise<User | null>
  updatePassword(userId: number, password: string): Promise<void>
  updatePin(userId: number, pin: string): Promise<void>
  updateUser(userId: number, userData: UpdateProfileRequest): Promise<void>
  deleteUser(userId: number): Promise<void>
  restoreUser(userId: number): Promise<void>
  permanentlyDeleteUser(userId: number): Promise<void>
}
