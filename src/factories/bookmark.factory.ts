import { PrismaBookmarkRepository } from '@/repositories/implementations/prisma/prisma-bookmark.repository'
import { BookmarkUseCase } from '@/use-cases/bookmark/bookmark'

export function makeBookmarkRepository() {
  return new PrismaBookmarkRepository()
}

export function makeBookmarkUseCase() {
  const bookmarkRepository = makeBookmarkRepository()
  return new BookmarkUseCase(bookmarkRepository)
} 