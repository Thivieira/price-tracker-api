import axios from "axios"
import { env } from "process"

const coingeckoApi = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
  headers: {
    'x-cg-demo-api-key': env.COINGECKO_API_KEY,
  },
})

export default coingeckoApi