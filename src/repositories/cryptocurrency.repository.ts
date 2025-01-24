import { Cryptocurrency } from '@prisma/client'

export interface CryptocurrencyRepository {
  findAll(params: Prisma.CryptocurrencyFindManyArgs): Promise<Cryptocurrency[]>
  count(params: Prisma.CryptocurrencyCountArgs): Promise<number>
  create(data: {
    symbol: string
    name: string
    marketCap: number
    high24h: number
    low24h: number
    high7d: number
    low7d: number
    athPrice: number
    athDate: Date
    atlPrice: number
    atlDate: Date
  }): Promise<Cryptocurrency>
  findBySymbol(symbol: string): Promise<Cryptocurrency | null>
  update(id: number, data: {
    marketCap: number
    high24h: number
    low24h: number
    high7d: number
    low7d: number
  }): Promise<Cryptocurrency>
  delete(id: number): Promise<void>
} 
