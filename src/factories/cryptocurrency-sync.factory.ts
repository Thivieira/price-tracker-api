import { makeCryptocurrencyRepository, makeCryptocurrencyService } from './crypto.factory'
import { CryptocurrencySyncService } from '@/services/cryptocurrency-sync.service'

export function makeCryptocurrencySyncService() {
  const cryptocurrencyRepository = makeCryptocurrencyRepository()
  const cryptocurrencyService = makeCryptocurrencyService()
  return new CryptocurrencySyncService(cryptocurrencyRepository, cryptocurrencyService)
} 