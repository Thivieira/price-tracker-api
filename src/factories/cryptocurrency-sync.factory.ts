import { makeCryptocurrencyRepository, makeCryptocurrencyService } from './crypto.factory'
import { CryptocurrencySyncService } from '@/services/cryptocurrency-sync.service'
import { ColorThiefService } from '@/services/color-thief.service'

export function makeCryptocurrencySyncService() {
  const cryptocurrencyRepository = makeCryptocurrencyRepository()
  const cryptocurrencyService = makeCryptocurrencyService()
  const colorThiefService = new ColorThiefService()

  return new CryptocurrencySyncService(
    cryptocurrencyRepository,
    cryptocurrencyService,
    colorThiefService
  )
} 