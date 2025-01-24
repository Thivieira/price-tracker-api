import { BookmarkRepository } from '@/repositories/bookmark.repository'
import { Bookmark } from '@prisma/client'

export class BookmarkUseCase {
  constructor(private bookmarkRepository: BookmarkRepository) { }

  async toggleBookmark(userId: number, coinId: number): Promise<{ action: 'added' | 'removed' }> {
    const existing = await this.bookmarkRepository.findByUserAndCoin(userId, coinId)

    if (existing) {
      await this.bookmarkRepository.delete(userId, coinId)
      return { action: 'removed' }
    }

    await this.bookmarkRepository.create(userId, coinId)
    return { action: 'added' }
  }

  async getUserBookmarks(userId: number): Promise<Bookmark[]> {
    return await this.bookmarkRepository.findByUser(userId)
  }
} 