export interface CryptocurrencyService {
  listCoins(params: {
    vs_currency?: string;
    per_page?: number;
    page?: number;
    sparkline?: boolean;
    price_change_percentage?: string;
    days?: number,
    interval?: string
  }): Promise<any>
  getCoin(id: string): Promise<any>
}
