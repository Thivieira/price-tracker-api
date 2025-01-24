import { Bookmark } from '@prisma/client'
import { BookmarkRepository } from '@/repositories/bookmark.repository'
import { prisma } from '@/lib/prisma'

export class PrismaBookmarkRepository implements BookmarkRepository {

  async findByUser(userId: number): Promise<Bookmark[]> {
    return await prisma.bookmark.findMany({
      where: {
        user_id: userId,
      },
      include: {
        coin: true,
      },
    })
  }

  async create(userId: number, coinId: number): Promise<Bookmark> {
    return await prisma.bookmark.create({
      data: {
        user_id: userId,
        coin_id: coinId,
      },
    })
  }

  async delete(userId: number, coinId: number): Promise<void> {
    await prisma.bookmark.delete({
      where: {
        user_id_coin_id: {
          user_id: userId,
          coin_id: coinId,
        },
      },
    })
  }

  async findByUserAndCoin(userId: number, coinId: number): Promise<Bookmark | null> {
    return await prisma.bookmark.findUnique({
      where: {
        user_id_coin_id: {
          user_id: userId,
          coin_id: coinId
        },
      },
    })
  }
} 