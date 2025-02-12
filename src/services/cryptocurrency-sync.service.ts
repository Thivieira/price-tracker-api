import { CryptocurrencyRepository } from '@/repositories/cryptocurrency.repository'
import { CryptocurrencyService } from '@/services/interfaces/cryptocurrency.service'
import { ColorThiefService } from '@/services/color-thief.service'

export class CryptocurrencySyncService {
  constructor(
    private readonly cryptocurrencyRepository: CryptocurrencyRepository,
    private readonly cryptocurrencyService: CryptocurrencyService,
    private readonly colorThiefService: ColorThiefService
  ) { }

  async syncCryptocurrencies() {
    console.log('Starting cryptocurrency sync...')

    try {
      const coins = await this.cryptocurrencyService.listCoins({
        vs_currency: 'usd',
        per_page: 250,
        page: 1,
        sparkline: true,
        price_change_percentage: '24h,7d',
        days: 7,
        interval: 'daily'
      })
      console.log(`Fetched ${coins.length} coins from CoinGecko`)

      let updated = 0
      let created = 0
      let errors = 0

      for (const coin of coins) {
        try {
          const existingCoin = await this.cryptocurrencyRepository.findBySymbol(coin.symbol)
          const image_url = coin.image_url
          const dominant_color = image_url
            ? await this.colorThiefService.getDominantColor(image_url)
            : undefined
          if (existingCoin) {
            await this.cryptocurrencyRepository.update(existingCoin.id, {
              market_cap: coin.market_cap,
              current_price: coin.current_price,
              high_24h: coin.high_24h,
              low_24h: coin.low_24h,
              high_7d: coin.high_7d,
              low_7d: coin.low_7d,
              image_url: image_url ?? undefined,
              dominant_color: dominant_color ?? undefined,
            })
            updated++
          } else {
            await this.cryptocurrencyRepository.create({
              symbol: coin.symbol,
              name: coin.name,
              current_price: coin.current_price,
              market_cap: coin.market_cap,
              high_24h: coin.high_24h,
              low_24h: coin.low_24h,
              high_7d: coin.high_7d,
              low_7d: coin.low_7d,
              ath_price: coin.ath.price,
              ath_date: new Date(coin.ath.timestamp),
              atl_price: coin.atl.price,
              atl_date: new Date(coin.atl.timestamp),
              image_url: image_url ?? undefined,
              dominant_color: dominant_color ?? undefined,
            })
            created++
          }
        } catch (error) {
          console.error(`Failed to sync coin ${coin.symbol}:`, error)
          errors++
        }
      }

      console.log(`Sync completed: ${created} created, ${updated} updated, ${errors} errors`)
    } catch (error) {
      console.error('Failed to sync cryptocurrencies:', error)
      throw new Error('Cryptocurrency sync failed')
    }
  }
} 