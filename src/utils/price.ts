import { z } from 'zod'

const priceSchema = z.number().nonnegative()

interface PriceRange {
  high: number
  low: number
}

export function calculatePriceRange(
  priceHistory: number[],
  currentPrice: number,
  decimals = 2
): PriceRange {
  try {
    // Validate inputs
    const validCurrentPrice = priceSchema.parse(currentPrice)
    const validPriceHistory = priceHistory.map(price => priceSchema.parse(price))

    if (validPriceHistory.length === 0) {
      const formattedPrice = Number(validCurrentPrice.toFixed(decimals))
      return {
        high: formattedPrice,
        low: formattedPrice
      }
    }

    return {
      high: Number(Math.max(...validPriceHistory).toFixed(decimals)),
      low: Number(Math.min(...validPriceHistory).toFixed(decimals))
    }
  } catch (error) {
    // Fallback to current price if validation fails
    const fallbackPrice = Number((currentPrice || 0).toFixed(decimals))
    return {
      high: fallbackPrice,
      low: fallbackPrice
    }
  }
} 