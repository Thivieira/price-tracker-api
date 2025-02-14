export interface CryptocurrencyService {
  listCoins(params: {
    vs_currency?: string;
    per_page?: number;
    page?: number;
    sparkline?: boolean;
    price_change_percentage?: string;
    days?: number,
    interval?: string;
    order?: string;
  }): Promise<any>
  getCoin(id: string): Promise<any>
  searchCoins(params: {
    query: string;
    vs_currency?: string;
    per_page?: number;
    page?: number;
  }): Promise<any>
  convertAmount(fromSymbol: string, toSymbol: string, amount: number, vs_currency: string): Promise<any>
}
