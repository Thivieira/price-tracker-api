import { Cryptocurrency, Prisma } from '@prisma/client'

export interface CryptocurrencyRepository {
  findAll(params: Prisma.CryptocurrencyFindManyArgs): Promise<Cryptocurrency[]>
  count(params: Prisma.CryptocurrencyCountArgs): Promise<number>
  create(data: {
    symbol: string
    name: string
    market_cap: number
    high_24h: number
    low_24h: number
    high_7d: number
    low_7d: number
    ath_price: number
    ath_date: Date
    atl_price: number
    atl_date: Date
  }): Promise<Cryptocurrency>
  findBySymbol(symbol: string): Promise<Cryptocurrency | null>
  update(id: number, data: {
    market_cap: number
    high_24h: number
    low_24h: number
    high_7d: number
    low_7d: number
  }): Promise<Cryptocurrency>
  delete(id: number): Promise<void>
} 
