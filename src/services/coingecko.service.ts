import { CryptocurrencyService } from "@/services/interfaces/cryptocurrency.service"

export class CoingeckoService implements CryptocurrencyService {
  async listCoins(): Promise<any> {
    return []
  }

  async getCoin(id: string): Promise<any> {
    return []
  }
}
