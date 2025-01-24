import { CryptocurrencyRepository } from '@/repositories/cryptocurrency.repository'
import { Prisma, Cryptocurrency } from '@prisma/client'

export class ListCoinsUseCase {
  constructor(private readonly cryptocurrencyRepository: CryptocurrencyRepository, private readonly cryptocurrencyService: CryptocurrencyService) { }

  async execute(params: Prisma.CryptocurrencyFindManyArgs): Promise<Cryptocurrency[]> {
    return await this.cryptocurrencyRepository.findAll(params)
  }

  async count(params: Prisma.CryptocurrencyCountArgs): Promise<number> {
    return await this.cryptocurrencyRepository.count(params)
  }
}
