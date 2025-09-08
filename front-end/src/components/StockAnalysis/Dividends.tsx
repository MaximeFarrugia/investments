import { useSuspenseQuery } from '@tanstack/react-query'
import {
  getHistoricalDividends,
  type HistoricalDividendsApiResponse,
} from '@/api/openbb'
import { useStockAnalysis } from './context'
import { useMemo } from 'react'

interface Props {
  content: (data: HistoricalDividendsApiResponse['results']) => React.ReactNode
}

const Dividends = ({ content }: Props) => {
  const { symbol } = useStockAnalysis()
  const { data } = useSuspenseQuery({
    queryKey: ['historical_dividends', symbol],
    queryFn: () => getHistoricalDividends(symbol),
    staleTime: 30 * 1000,
  })

  const chartData = useMemo(
    () =>
      data.data.results.map((e, idx) => ({
        ...e,
        growth_percent:
          idx === 0
            ? undefined
            : (((e.amount - data.data.results[idx - 1].amount) /
                data.data.results[idx - 1].amount) *
              100 || undefined),
      })),
    [data],
  )

  return content(chartData)
}

export default Dividends
