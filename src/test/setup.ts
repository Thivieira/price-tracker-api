import { execSync } from 'child_process'
import { env } from '@/env'
import { prisma } from '@/lib/prisma'
import { beforeAll, afterAll, beforeEach } from 'vitest'

process.env.NODE_ENV = 'test'

async function setupTestDatabase() {
  if (env.NODE_ENV !== 'test') {
    throw new Error('Test setup must run in test environment')
  }

  const maxRetries = 3
  let retries = 0

  while (retries < maxRetries) {
    try {
      // Ensure connection is closed before starting
      await prisma.$disconnect()

      // Drop existing schema
      await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE;')

      // Create new schema
      await prisma.$executeRawUnsafe('CREATE SCHEMA IF NOT EXISTS public;')

      // Grant privileges
      await prisma.$executeRawUnsafe('GRANT ALL ON SCHEMA public TO public;')

      // Push the schema without existing enum conflicts
      execSync('pnpm dlx prisma db push --force-reset --accept-data-loss', {
        env: {
          ...process.env,
          DATABASE_URL: env.TEST_DATABASE_URL,
        },
        stdio: 'inherit',
      })

      // Verify connection and schema
      await prisma.$connect()

      // If successful, break the retry loop
      break
    } catch (error) {
      retries++
      if (retries === maxRetries) {
        console.error('Error setting up test database:', error)
        process.exit(1)
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

// Setup global test hooks
beforeAll(async () => {
  await setupTestDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
}) 