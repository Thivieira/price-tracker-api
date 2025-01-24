import { CryptocurrencyRepository } from '@/repositories/cryptocurrency.repository'
import { prisma } from '@/lib/prisma'
import { Prisma, Cryptocurrency } from '@prisma/client'

import { UserCreationException } from '@/exceptions/user.exceptions'

export class PrismaCryptocurrencyRepository implements CryptocurrencyRepository {
  constructor() { }

  async create(cryptocurrencyData: Partial<Cryptocurrency>): Promise<Cryptocurrency> {
    try {
      const validatedData: Prisma.CryptocurrencyCreateInput = {
        symbol: cryptocurrencyData.symbol!,
        name: cryptocurrencyData.name!,
        market_cap: cryptocurrencyData.market_cap!,
        high_24h: cryptocurrencyData.high_24h!,
        low_24h: cryptocurrencyData.low_24h!,
        high_7d: cryptocurrencyData.high_7d!,
        low_7d: cryptocurrencyData.low_7d!,
        ath_price: cryptocurrencyData.ath_price!,
        ath_date: cryptocurrencyData.ath_date!,
        atl_price: cryptocurrencyData.atl_price!,
        atl_date: cryptocurrencyData.atl_date!,
        created_at: new Date(),
        updated_at: new Date(),
      };

      return await prisma.cryptocurrency.create({
        data: validatedData,
      });
    } catch (error) {
      console.error(error);
      throw new UserCreationException('Failed to create cryptocurrency');
    }
  }

  async update(cryptocurrencyId: number, cryptocurrencyData: Partial<Cryptocurrency>): Promise<Cryptocurrency> {
    const updatedCryptocurrency = await prisma.cryptocurrency.update({
      where: { id: cryptocurrencyId },
      data: { ...cryptocurrencyData, updated_at: new Date() },
    });
    return updatedCryptocurrency;
  }

  async findAll(params: Prisma.CryptocurrencyFindManyArgs): Promise<Cryptocurrency[]> {
    return await prisma.cryptocurrency.findMany(params)
  }

  async count(params: Prisma.CryptocurrencyCountArgs): Promise<number> {
    return await prisma.cryptocurrency.count(params)
  }

  async findById(id: number): Promise<Cryptocurrency | null> {
    return await prisma.cryptocurrency.findUnique({ where: { id } })
  }

  async findBySymbol(symbol: string): Promise<Cryptocurrency | null> {
    return await prisma.cryptocurrency.findUnique({ where: { symbol } })
  }

  async delete(id: number): Promise<void> {
    await prisma.cryptocurrency.update({ where: { id }, data: { deleted_at: new Date() } })
  }

  async restore(id: number): Promise<void> {
    await prisma.cryptocurrency.update({ where: { id }, data: { deleted_at: null } })
  }

  async permanentlyDelete(id: number): Promise<void> {
    await prisma.cryptocurrency.delete({ where: { id } })
  }

}
