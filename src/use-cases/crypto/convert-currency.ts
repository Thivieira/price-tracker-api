import { CryptocurrencyService } from '@/services/interfaces/cryptocurrency.service'
import { z } from 'zod'

const conversionSchema = z.object({
  fromSymbol: z.string(),
  toSymbol: z.string(),
  amount: z.number().positive()
})

export class ConvertCurrencyUseCase {
  constructor(private readonly cryptocurrencyService: CryptocurrencyService) { }

  async execute(params: z.infer<typeof conversionSchema>) {
    const validation = conversionSchema.safeParse(params)

    if (!validation.success) {
      throw new Error('Invalid conversion parameters')
    }

    const { fromSymbol, toSymbol, amount } = validation.data

    return await this.cryptocurrencyService.convertAmount(
      fromSymbol.toLowerCase(),
      toSymbol.toLowerCase(),
      amount
    )
  }
} 