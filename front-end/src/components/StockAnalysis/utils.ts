import { getFinancials, getCompanyInfo } from '@/api/financial'
import {
  getHistoricalPrice,
  getHistoricalDividends,
  getCompanyProfile,
} from '@/api/openbb'
import type { QueryClient } from '@tanstack/react-query'

export const preloadStockAnalysisData = (
  queryClient: QueryClient,
  symbol: string,
  annual: boolean,
) => {
  queryClient.prefetchQuery({
    queryKey: ['historical_price', symbol],
    queryFn: () => getHistoricalPrice(symbol),
    staleTime: 30 * 1000,
  })
  queryClient.prefetchQuery({
    queryKey: ['historical_dividends', symbol],
    queryFn: () => getHistoricalDividends(symbol),
    staleTime: 30 * 1000,
  })
  queryClient.prefetchQuery({
    queryKey: ['financials', symbol, annual],
    queryFn: () => getFinancials(symbol, annual),
    staleTime: 30 * 1000,
  })
  queryClient.prefetchQuery({
    queryKey: ['company_profile', symbol],
    queryFn: () => getCompanyProfile(symbol),
    staleTime: 30 * 1000,
  })
  queryClient.prefetchQuery({
    queryKey: ['company_info', symbol],
    queryFn: () => getCompanyInfo(symbol),
    staleTime: 30 * 1000,
  })
}

export const clearStockAnalysisDataCache = (
  queryClient: QueryClient,
  symbol: string,
  annual: boolean,
) => {
  queryClient.removeQueries({
    queryKey: ['historical_price', symbol],
  })
  queryClient.removeQueries({
    queryKey: ['historical_dividends', symbol],
  })
  queryClient.removeQueries({
    queryKey: ['financials', symbol, annual],
  })
  queryClient.removeQueries({
    queryKey: ['company_profile', symbol],
  })
  queryClient.removeQueries({
    queryKey: ['company_info', symbol],
  })
}
