import { CryptocurrencyService } from "@/services/interfaces/cryptocurrency.service"
import coingeckoApi from "@/lib/coingecko"
import { calculatePriceRange } from '@/utils/price'
import { CoinGeckoMarketsResponse, Coin } from "@/types/coingecko.types"

interface CoinGeckoResponse {
  symbol: string
  name: string
  market_cap: number
  high_24h: number
  low_24h: number
  high_7d: number
  low_7d: number
  ath: number
  ath_date: string
  atl: number
  atl_date: string
}

interface ConversionRate {
  rate: number
  lastUpdated: string
}

export class CoingeckoService implements CryptocurrencyService {
  async listCoins({
    vs_currency = 'usd',
    per_page = 250,
    page = 1,
    sparkline = true,
    price_change_percentage = '24h,7d',
    days = 7,
    interval = 'daily'
  }): Promise<any> {
    try {
      const response = await coingeckoApi.get<CoinGeckoMarketsResponse>('/coins/markets', {
        params: {
          vs_currency,
          order: 'market_cap_desc',
          per_page,
          page,
          sparkline,
          price_change_percentage,
          days,
          interval
        }
      })

      return response.data.map((coin: Coin) => {
        // Extract 7-day price history from sparkline data
        const priceHistory = coin.sparkline_in_7d?.price || []
        const { high: high7d, low: low7d } = calculatePriceRange(
          priceHistory,
          coin.current_price
        )

        return {
          symbol: coin.symbol.toLowerCase(),
          name: coin.name,
          market_cap: Math.round(coin.market_cap || 0), // Round market cap to whole numbers
          high_24h: Number((coin.high_24h || 0).toFixed(2)),
          low_24h: Number((coin.low_24h || 0).toFixed(2)),
          high_7d: high7d,
          low_7d: low7d,
          ath: {
            price: coin.ath || 0,
            timestamp: coin.ath_date || new Date().toISOString()
          },
          atl: {
            price: coin.atl || 0,
            timestamp: coin.atl_date || new Date().toISOString()
          },
          image_url: coin.image
        }
      })
    } catch (error) {
      console.error('Failed to fetch coins from CoinGecko:', error)
      throw new Error('Failed to fetch cryptocurrency data')
    }
  }

  async getCoin(id: string): Promise<CoinGeckoResponse> {
    try {
      const response = await coingeckoApi.get(`/coins/${id}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch coin ${id} from CoinGecko:`, error)
      throw new Error(`Failed to fetch cryptocurrency ${id}`)
    }
  }

  async getConversionRate(fromSymbol: string, toSymbol: string): Promise<ConversionRate> {
    try {
      // Get current prices for both coins in USD
      const response = await coingeckoApi.get('/simple/price', {
        params: {
          ids: `${fromSymbol},${toSymbol}`,
          vs_currencies: 'usd',
          include_last_updated_at: true
        }
      })

      const fromUsdPrice = response.data[fromSymbol]?.usd
      const toUsdPrice = response.data[toSymbol]?.usd

      if (!fromUsdPrice || !toUsdPrice) {
        throw new Error('Unable to fetch conversion rates')
      }

      // Calculate the conversion rate (how many target coins you get for 1 source coin)
      const rate = fromUsdPrice / toUsdPrice

      return {
        rate,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to fetch conversion rate:', error)
      throw new Error('Failed to fetch conversion rate')
    }
  }

  async convertAmount(
    fromSymbol: string,
    toSymbol: string,
    amount: number
  ): Promise<{
    fromAmount: number
    toAmount: number
    rate: number
    lastUpdated: string
  }> {
    const { rate, lastUpdated } = await this.getConversionRate(fromSymbol, toSymbol)

    // Calculate how many target coins you get for the given amount of source coins
    const toAmount = amount * rate

    return {
      fromAmount: amount,
      toAmount: Number(toAmount.toFixed(8)),
      rate,
      lastUpdated
    }
  }
}
