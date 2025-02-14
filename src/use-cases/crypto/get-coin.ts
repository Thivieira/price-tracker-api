import { CryptocurrencyRepository } from '@/repositories/cryptocurrency.repository'
import { CryptocurrencyService } from '@/services/interfaces/cryptocurrency.service'
import { Cryptocurrency } from '@prisma/client'

interface GetCoinParams {
  symbol: string
  vs_currency?: string
  forceFetch?: boolean
}

export class GetCoinUseCase {
  constructor(
    private readonly cryptocurrencyRepository: CryptocurrencyRepository,
    private readonly cryptocurrencyService: CryptocurrencyService
  ) { }

  async execute({ symbol, vs_currency = 'usd', forceFetch = false }: GetCoinParams): Promise<Cryptocurrency | null> {
    // If not USD or force fetch is true, get from CoinGecko
    if (vs_currency !== 'usd' || forceFetch) {
      const searchResults = await this.cryptocurrencyService.searchCoins({
        query: symbol,
        vs_currency
      })

      // Return the first exact match if found
      return searchResults.find((coin: Cryptocurrency) =>
        coin.symbol.toLowerCase() === symbol.toLowerCase()
      ) || null
    }

    // Otherwise fetch from database
    return await this.cryptocurrencyRepository.findBySymbol(symbol.toLowerCase())
  }
} 