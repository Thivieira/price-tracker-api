
import { makeBookmarkUseCase } from '@/factories/bookmark.factory'
import { json } from '@/lib/json'
import { FastifyReply, FastifyRequest } from 'fastify'

export default async function listBookmarks(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = Number(request.user.sub)
    const bookmarks = await makeBookmarkUseCase().getUserBookmarks(userId)

    return reply.status(200).send(
      json({
        success: true,
        data: bookmarks
      })
    )
  } catch (error) {
    console.error(error)
    return reply.status(500).send(
      json({
        success: false,
        message: 'Failed to fetch bookmarks'
      })
    )
  }
}