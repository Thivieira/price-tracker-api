import { PrismaCryptocurrencyRepository } from '@/repositories/implementations/prisma/prisma-cryptocurrency.repository'
import { CoingeckoService } from '@/services/coingecko.service'
import { ListCoinsUseCase } from '@/use-cases/crypto/list-coins'
import { CryptocurrencyService } from '@/services/interfaces/cryptocurrency.service'
import { GetCoinUseCase } from '@/use-cases/crypto/get-coin'
import { ConvertCurrencyUseCase } from '@/use-cases/crypto/convert-currency'
import { ColorThiefService } from '@/services/color-thief.service'

export function makeCryptocurrencyRepository() {
  return new PrismaCryptocurrencyRepository()
}

export function makeCryptocurrencyService(): CryptocurrencyService {
  const colorThiefService = new ColorThiefService()
  return new CoingeckoService(colorThiefService)
}

export function makeListCoinsUseCase() {
  const cryptocurrencyRepository = makeCryptocurrencyRepository()
  const cryptocurrencyService = makeCryptocurrencyService()
  return new ListCoinsUseCase(cryptocurrencyRepository, cryptocurrencyService)
}

export function makeGetCoinUseCase() {
  const cryptocurrencyRepository = makeCryptocurrencyRepository()
  return new GetCoinUseCase(cryptocurrencyRepository)
}

export function makeConvertCurrencyUseCase() {
  const cryptocurrencyService = makeCryptocurrencyService()
  return new ConvertCurrencyUseCase(cryptocurrencyService)
}
