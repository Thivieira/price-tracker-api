import { Bookmark } from '@prisma/client'

export interface BookmarkRepository {
  create(userId: number, coinId: number): Promise<Bookmark>
  delete(userId: number, coinId: number): Promise<void>
  findByUserAndCoin(userId: number, coinId: number): Promise<Bookmark | null>
  findByUser(userId: number): Promise<Bookmark[]>
} 