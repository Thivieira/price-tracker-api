import { PrismaCryptocurrencyRepository } from '@/repositories/implementations/prisma/prisma-cryptocurrency.repository'
import { CoingeckoService } from '@/services/coingecko.service'
import { ListCoinsUseCase } from '@/use-cases/crypto/list-coins'
import { CryptocurrencyService } from '@/services/interfaces/cryptocurrency.service'

export function makeCryptocurrencyRepository() {
  return new PrismaCryptocurrencyRepository()
}

export function makeCryptocurrencyService(): CryptocurrencyService {
  return new CoingeckoService()
}

export function makeListCoinsUseCase() {
  const cryptocurrencyRepository = makeCryptocurrencyRepository()
  const cryptocurrencyService = makeCryptocurrencyService()
  return new ListCoinsUseCase(cryptocurrencyRepository, cryptocurrencyService)
} 
