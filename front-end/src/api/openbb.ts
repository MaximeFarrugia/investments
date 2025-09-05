import axios from 'axios'

export interface HistoricalPriceApiResponse {
  results: Array<{
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
    dividend: number
  }>
}

export const getHistoricalPrice = (symbol: string) => {
  return axios.get<HistoricalPriceApiResponse>(
    '/openbb/api/v1/equity/price/historical',
    {
      params: {
        provider: 'yfinance',
        symbol,
        start_date: '1970-01-01',
      },
    },
  )
}

export interface HistoricalDividendsApiResponse {
  results: Array<{
    ex_dividend_date: string
    amount: number
  }>
}

export const getHistoricalDividends = (symbol: string) => {
  return axios.get<HistoricalDividendsApiResponse>(
    '/openbb/api/v1/equity/fundamental/dividends',
    {
      params: {
        provider: 'yfinance',
        symbol,
        start_date: '1970-01-01',
      },
    },
  )
}
