import { CryptocurrencyRepository } from '@/repositories/cryptocurrency.repository'
import { Cryptocurrency } from '@prisma/client'

export class GetCoinUseCase {
  constructor(
    private readonly cryptocurrencyRepository: CryptocurrencyRepository
  ) { }

  async execute(id: number): Promise<Cryptocurrency | null> {
    return await this.cryptocurrencyRepository.findById(id)
  }
} 