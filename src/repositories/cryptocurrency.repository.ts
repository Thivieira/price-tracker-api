import { Cryptocurrency, Prisma } from '@prisma/client'

export interface CryptocurrencyRepository {
  findBySymbol(symbol: string): Promise<Cryptocurrency | null>
  findAll(params: Prisma.CryptocurrencyFindManyArgs): Promise<Cryptocurrency[]>
  count(params: Prisma.CryptocurrencyCountArgs): Promise<number>
  create(data: {
    symbol: string
    name: string
    current_price: number
    market_cap: number
    high_24h: number
    low_24h: number
    high_7d: number
    low_7d: number
    ath_price: number
    ath_date: Date
    atl_price: number
    atl_date: Date
    image_url?: string
    dominant_color?: string
  }): Promise<Cryptocurrency>
  findBySymbol(symbol: string): Promise<Cryptocurrency | null>
  update(id: number, data: {
    current_price: number
    market_cap: number
    high_24h: number
    low_24h: number
    high_7d: number
    low_7d: number
    image_url?: string
    dominant_color?: string
  }): Promise<Cryptocurrency>
  delete(id: number): Promise<void>
} 
