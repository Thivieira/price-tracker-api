import { env } from '@/env'
import { PrismaClient } from '@prisma/client'

export function makePrismaClient() {
  const databaseUrl = env.NODE_ENV === 'test'
    ? env.TEST_DATABASE_URL
    : env.DATABASE_URL

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      }
    },
    log: env.NODE_ENV === 'dev' ? ['error'] : [],
  })
}

export const prisma = makePrismaClient()