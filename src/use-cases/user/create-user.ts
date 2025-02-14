import { UserRepository } from '@/repositories/user.repository'
import { Prisma } from '@prisma/client'
interface CreateUserData extends Omit<Prisma.UserCreateInput, 'created_at' | 'updated_at'> {
  username: string
  password: string
  first_name: string
  last_name: string
  phone: string
  birthdate: string
  street_address: string
  unit_number: string
  city: string
  region: string
  zip_code: string
  role: 'CUSTOMER'
  hashed_pin: string
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) { }

  async execute(userData: any) {
    const userCreateData = {
      ...userData,
      created_at: new Date(),
      updated_at: new Date(),
      // Add default values for required fields
      RefreshToken: undefined,
      pin_expires_at: null,
      deleted_at: null,
      OTPVerification: undefined,
      Bookmark: undefined
    }

    return await this.userRepository.createUser(userCreateData)
  }
}
