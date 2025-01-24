import { app } from '@/app'
import { env } from '@/env'
import cron from 'node-cron'
import { TokenCleanupService } from '@/services/token-cleanup.service'
import { PrismaRefreshTokenRepository } from '@/repositories/implementations/prisma/prisma-refresh-token.repository'

async function run() {
  const tokenCleanupService = new TokenCleanupService(new PrismaRefreshTokenRepository())

  // Run cleanup every day at midnight
  cron.schedule('0 0 * * *', () => {
    tokenCleanupService.cleanupExpiredTokens()
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
