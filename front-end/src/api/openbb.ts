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

export interface CompanyProfileApiResponse {
  results: Array<{
    symbol: string
    name?: string
    stock_exchange: string
    long_description?: string
    company_url?: string
    business_phone_no?: string
    hq_address1?: string
    hq_address_city?: string
    hq_address_postal_code?: string
    hq_country?: string
    employees?: number
    sector?: string
    industry_category?: string
    issue_type: string
    currency?: string
    market_cap?: number
    shares_outstanding?: number
    shares_float?: number
    shares_implied_outstanding?: number
    shares_short?: number
    dividend_yield?: number
    beta?: number
  }>
}

export const getCompanyProfile = (symbol: string) => {
  return axios.get<CompanyProfileApiResponse>('/openbb/api/v1/equity/profile', {
    params: {
      provider: 'yfinance',
      symbol,
    },
  })
}
