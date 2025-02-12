import { CryptocurrencyRepository } from '@/repositories/cryptocurrency.repository'
import { CryptocurrencyService } from '@/services/interfaces/cryptocurrency.service'
import { Prisma, Cryptocurrency } from '@prisma/client'

interface ListCoinsParams {
  vs_currency: string
  skip: number
  take: number
  search?: string
  sort: string
  order: 'asc' | 'desc'
  page?: number
  forceFetch?: boolean
}

export class ListCoinsUseCase {
  constructor(
    private readonly cryptocurrencyRepository: CryptocurrencyRepository,
    private readonly cryptocurrencyService: CryptocurrencyService
  ) { }

  async execute(params: ListCoinsParams): Promise<[Cryptocurrency[], number]> {
    if (params.vs_currency !== 'usd' || params.forceFetch) {

      if (params.search) {
        const searchResults = await this.cryptocurrencyService.searchCoins({
          query: params.search || '',
          vs_currency: params.vs_currency,
          per_page: params.take,
          page: params.page || 1
        })

        return [searchResults, searchResults.length]
      }

      const coins = await this.cryptocurrencyService.listCoins({
        vs_currency: params.vs_currency,
        order: 'market_cap_desc',
        per_page: params.take,
        page: params.page || 1,
        sparkline: false,
        price_change_percentage: '24h,7d',
        days: 7,
        interval: 'daily'
      })

      return [coins, coins.length]
    }

    const [coins, total] = await Promise.all([
      this.cryptocurrencyRepository.findAll({
        skip: params.skip,
        take: params.take,
        where: {
          deleted_at: null,
          ...(params.search && {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { symbol: { contains: params.search, mode: 'insensitive' } }
            ]
          })
        },
        orderBy: {
          [params.sort]: params.order
        }
      }),
      this.cryptocurrencyRepository.count({
        where: {
          deleted_at: null,
          ...(params.search && {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { symbol: { contains: params.search, mode: 'insensitive' } }
            ]
          })
        }
      })
    ])

    return [coins, total]
  }
}
