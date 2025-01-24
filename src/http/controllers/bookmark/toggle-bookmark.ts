import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeBookmarkUseCase } from '@/factories/bookmark.factory'
import { json } from '@/lib/json'
import { makeCryptocurrencyRepository } from '@/factories/crypto.factory'

export default async function toggleBookmark(request: FastifyRequest, reply: FastifyReply) {
  try {
    const paramsSchema = z.object({
      coinId: z.string(),
    })

    const { coinId } = paramsSchema.parse(request.params)
    const userId = Number(request.user.sub)

    // First find the cryptocurrency by symbol
    const cryptocurrencyRepository = makeCryptocurrencyRepository()
    const coin = await cryptocurrencyRepository.findBySymbol(coinId.toLowerCase())

    if (!coin) {
      return reply.status(404).send(
        json({
          success: false,
          message: 'Cryptocurrency not found'
        })
      )
    }

    const result = await makeBookmarkUseCase().toggleBookmark(userId, coin.id)

    return reply.status(200).send(
      json({
        success: true,
        message: result.action === 'added' ? 'Coin bookmarked' : 'Bookmark removed',
        action: result.action
      })
    )
  } catch (error) {
    console.error(error)
    return reply.status(500).send(
      json({
        success: false,
        message: 'Failed to toggle bookmark'
      })
    )
  }
} 