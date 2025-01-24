import { FastifyReply, FastifyRequest } from "fastify"
import { json } from "@/lib/json"
import { makeCryptocurrencySyncService } from "@/factories/cryptocurrency-sync.factory"

export default async function syncCoins(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const cryptocurrencySyncService = makeCryptocurrencySyncService()
    await cryptocurrencySyncService.syncCryptocurrencies()

    return reply.status(200).send(
      json({
        success: true,
        message: 'Cryptocurrency sync completed successfully'
      })
    )
  } catch (error) {
    console.error('Failed to sync cryptocurrencies:', error)
    return reply.status(500).send(
      json({
        success: false,
        message: 'Failed to sync cryptocurrencies'
      })
    )
  }
} 