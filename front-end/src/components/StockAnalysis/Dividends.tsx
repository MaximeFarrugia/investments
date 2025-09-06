import { useSuspenseQuery } from '@tanstack/react-query'
import {
  getHistoricalDividends,
  type HistoricalDividendsApiResponse,
} from '@/api/openbb'
import { useStockAnalysis } from './context'

interface Props {
  content: (data: HistoricalDividendsApiResponse['results']) => React.ReactNode
}

const Dividends = ({ content }: Props) => {
  const { symbol } = useStockAnalysis()
  const { data } = useSuspenseQuery({
    queryKey: ['historical_dividends', symbol],
    queryFn: () => getHistoricalDividends(symbol),
    gcTime: 30 * 1000,
    staleTime: 30 * 1000,
  })

  return content(data.data.results)
}

export default Dividends
