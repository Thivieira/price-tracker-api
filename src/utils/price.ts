import { z } from 'zod'

const priceSchema = z.number().nonnegative()

interface PriceRange {
  high: number
  low: number
}

export function calculatePriceRange(
  priceHistory: number[],
  currentPrice: number
): PriceRange {
  try {
    // Validate inputs
    const validCurrentPrice = priceSchema.parse(currentPrice)
    const validPriceHistory = priceHistory.map(price => priceSchema.parse(price))

    if (validPriceHistory.length === 0) {
      return {
        high: validCurrentPrice,
        low: validCurrentPrice
      }
    }

    return {
      high: Math.max(...validPriceHistory),
      low: Math.min(...validPriceHistory)
    }
  } catch (error) {
    // Fallback to current price if validation fails
    const fallbackPrice = currentPrice || 0
    return {
      high: fallbackPrice,
      low: fallbackPrice
    }
  }
} 