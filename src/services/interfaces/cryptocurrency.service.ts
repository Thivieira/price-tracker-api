export interface CryptocurrencyService {
  listCoins(): Promise<any>
  getCoin(id: string): Promise<any>
}
