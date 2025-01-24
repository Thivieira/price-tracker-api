import { app } from '@/app'
import { env } from '@/env'
import cron from 'node-cron'
import { TokenCleanupService } from '@/services/token-cleanup.service'
import { PrismaRefreshTokenRepository } from '@/repositories/implementations/prisma/prisma-refresh-token.repository'
import { makeCryptocurrencySyncService } from '@/factories/cryptocurrency-sync.factory'

async function run() {
  const tokenCleanupService = new TokenCleanupService(new PrismaRefreshTokenRepository())
  const cryptocurrencySyncService = makeCryptocurrencySyncService()

  // Run initial sync
  await cryptocurrencySyncService.syncCryptocurrencies()

  // Run cleanup every day at midnight
  cron.schedule('0 0 * * *', () => {
    tokenCleanupService.cleanupExpiredTokens()
  })

  // Update crypto data every 5 minutes with a random delay (0-30 seconds)
  cron.schedule('*/5 * * * *', () => {
    const randomDelay = Math.floor(Math.random() * 30000) // 0-30 seconds
    setTimeout(() => {
      cryptocurrencySyncService.syncCryptocurrencies()
    }, randomDelay)
  })

  try {
    await app.listen({
      host: '127.0.0.1',
      port: env.PORT,
    })
    console.log(`🚀 HTTP Server running on port ${env.PORT}!`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

run()
