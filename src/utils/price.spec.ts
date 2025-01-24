import { describe, it, expect } from 'vitest'
import { calculatePriceRange } from './price'

describe('calculatePriceRange', () => {
  it('should calculate correct price range from history', () => {
    const priceHistory = [100.123, 200.456, 150.789]
    const currentPrice = 175.5

    const result = calculatePriceRange(priceHistory, currentPrice)

    expect(result).toEqual({
      high: 200.46,
      low: 100.12
    })
  })

  it('should use current price when history is empty', () => {
    const result = calculatePriceRange([], 150.789)

    expect(result).toEqual({
      high: 150.79,
      low: 150.79
    })
  })

  it('should handle custom decimal places', () => {
    const priceHistory = [100.12345, 200.45678]
    const currentPrice = 150.789

    const result = calculatePriceRange(priceHistory, currentPrice, 3)

    expect(result).toEqual({
      high: 200.457,
      low: 100.123
    })
  })

  it('should handle invalid inputs gracefully', () => {
    const result = calculatePriceRange([-100, NaN, Infinity], -50)

    expect(result).toEqual({
      high: 0.00,
      low: 0.00
    })
  })
}) 