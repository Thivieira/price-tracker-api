import { CryptocurrencyService } from "@/services/interfaces/cryptocurrency.service"
import coingeckoApi from "@/lib/coingecko"
import { calculatePriceRange } from '@/utils/price'
import { CoinGeckoMarketsResponse, Coin } from "@/types/coingecko.types"
import { ColorThiefService } from "./color-thief.service"
import dayjs from '@/lib/dayjs'

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
  constructor(private readonly colorThiefService: ColorThiefService) { }
  async searchCoins(
    { query, vs_currency = 'usd',
      per_page = 250,
      page = 1,
      sparkline = true,
      price_change_percentage = '24h,7d',
      days = 7,
      interval = 'daily' }: { query: string, vs_currency?: string, per_page?: number, page?: number, sparkline?: boolean, price_change_percentage?: string, days?: number, interval?: string }): Promise<any> {
    try {
      // First get search results
      const searchResponse = await coingeckoApi.get('/search', {
        params: {
          query: query.toLowerCase(),
        }
      })

      // Extract coin IDs from search results (limit to top 10)
      const coinIds = searchResponse.data.coins
        .slice(0, 10)
        .map((coin: { id: string }) => coin.id)
        .join(',')

      // Fetch current prices and other market data for found coins
      const marketResponse = await coingeckoApi.get('/coins/markets', {
        params: {
          vs_currency,
          ids: coinIds,
          order: 'market_cap_desc',
          per_page,
          page,
          sparkline,
          price_change_percentage,
          days,
          interval
        }
      })

      return Promise.all(marketResponse.data.map(async (coin: Coin) => {

        const priceHistory = coin.sparkline_in_7d?.price || []
        const { high: high7d, low: low7d } = calculatePriceRange(
          priceHistory,
          coin.current_price
        )

        const dominant_color = coin.image
          ? await this.colorThiefService.getDominantColor(coin.image)
          : '#000000'

        return {
          id: coin.id,
          symbol: coin.symbol.toLowerCase(),
          name: coin.name,
          current_price: coin.current_price || 0,
          market_cap: coin.market_cap || 0,
          high_24h: coin.high_24h || 0,
          low_24h: coin.low_24h || 0,
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
          image_url: coin.image,
          dominant_color: dominant_color
        }
      }))
    } catch (error) {
      console.error('Failed to search coins:', error)
      throw new Error('Failed to search cryptocurrencies')
    }
  }

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

      return Promise.all(response.data.map(async (coin: Coin) => {
        // Extract 7-day price history from sparkline data
        const priceHistory = coin.sparkline_in_7d?.price || []
        const { high: high7d, low: low7d } = calculatePriceRange(
          priceHistory,
          coin.current_price
        )

        const dominant_color = coin.image
          ? await this.colorThiefService.getDominantColor(coin.image)
          : '#000000'

        return {
          symbol: coin.symbol.toLowerCase(),
          name: coin.name,
          current_price: coin.current_price || 0,
          market_cap: coin.market_cap || 0,
          high_24h: coin.high_24h || 0,
          low_24h: coin.low_24h || 0,
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
          image_url: coin.image,
          dominant_color: dominant_color
        }
      }))
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

  async getConversionRate(fromSymbol: string, toSymbol: string, vs_currency: string = 'usd'): Promise<ConversionRate & {
    fromPrice: number;
    toPrice: number;
  }> {
    try {
      // First, search for the coins to get their IDs
      const coinsList = await coingeckoApi.get<{
        "id": string,
        "symbol": string,
        "name": string
      }[]>('/coins/list');

      // Find the coin IDs from search results using name instead of symbol
      const fromCoin = coinsList.data.find(
        (coin: { name: string }) => coin.name.toLowerCase() === fromSymbol.toLowerCase()
      );
      const toCoin = coinsList.data.find(
        (coin: { name: string }) => coin.name.toLowerCase() === toSymbol.toLowerCase()
      );

      if (!fromCoin || !toCoin) {
        throw new Error(`Unable to find coin IDs for ${fromSymbol} and/or ${toSymbol}`);
      }

      console.log("FROM SYMBOL: ", fromSymbol)
      console.log("TO SYMBOL: ", toSymbol)
      console.log("FROM COIN: ", fromCoin)
      console.log("TO COIN: ", toCoin)

      // Get current prices using coin IDs
      const response = await coingeckoApi.get<{
        [key: string]: {
          [key: string]: number,
          last_updated_at: number
        }
      }>('/simple/price', {
        params: {
          ids: `${fromCoin.id},${toCoin.id}`,
          vs_currencies: vs_currency,
          include_last_updated_at: true
        }
      });

      // Check if we have valid data for both coins
      if (!response.data ||
        !response.data[fromCoin.id] ||
        !response.data[toCoin.id]) {
        throw new Error(`Unable to fetch prices for ${fromSymbol} and/or ${toSymbol}`);
      }

      console.log("/simple/price PARAMS: ", {
        ids: `${fromCoin.id},${toCoin.id}`,
        vs_currencies: vs_currency,
        include_last_updated_at: true
      })

      console.log("/simple/price THE TEST: ", response.data)

      const fromCurrencyPrice = Number(response.data[fromCoin.id][vs_currency.toLowerCase()]);
      const toCurrencyPrice = Number(response.data[toCoin.id][vs_currency.toLowerCase()]);

      if (isNaN(fromCurrencyPrice) || isNaN(toCurrencyPrice)) {
        throw new Error('Invalid price data received from API');
      }

      if (toCurrencyPrice === 0) {
        throw new Error('Cannot convert: target currency has zero value');
      }

      // Calculate how many target coins (e.g., ETH) you get for 1 source coin (e.g., BTC)
      const rate = fromCurrencyPrice / toCurrencyPrice;

      return {
        rate,
        fromPrice: fromCurrencyPrice,
        toPrice: toCurrencyPrice,
        lastUpdated: dayjs.unix(response.data[fromCoin.id].last_updated_at).toISOString()
      };
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      if (error.response?.status === 404) {
        throw new Error('One or both cryptocurrencies not found')
      }

      console.error('Failed to fetch conversion rate:', error.message)
      throw new Error(error.message || 'Failed to fetch conversion rate')
    }
  }

  async convertAmount(
    fromSymbol: string,
    toSymbol: string,
    amount: number,
    vs_currency: string = 'usd'
  ): Promise<{
    fromAmount: number;
    toAmount: number;
    rate: number;
    fromPrice: number;
    toPrice: number;
    lastUpdated: string;
  }> {
    const { rate, fromPrice, toPrice, lastUpdated } = await this.getConversionRate(fromSymbol, toSymbol, vs_currency);

    const toAmount = amount * rate;

    return {
      fromAmount: amount,
      toAmount,
      rate,
      fromPrice,
      toPrice,
      lastUpdated
    };
  }
}
