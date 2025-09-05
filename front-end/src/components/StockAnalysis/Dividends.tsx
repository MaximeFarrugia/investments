import { useQuery } from '@tanstack/react-query'
import ApiError from '../ApiError'
import { getHistoricalDividends, type HistoricalDividendsApiResponse } from '@/api/openbb'
import { useStockAnalysis } from './context'

interface Props {
  content: (data: HistoricalDividendsApiResponse['results']) => React.ReactNode
}

const Dividends = ({ content }: Props) => {
  const { symbol } = useStockAnalysis()
  const { isPending, error, data } = useQuery({
    queryKey: ['historical_dividends', symbol],
    queryFn: () => getHistoricalDividends(symbol),
  })

  if (isPending) {
    return <p>Loading historical dividends...</p>
  }

  if (error) {
    return <ApiError error={error} />
  }

  return content(data.data.results)
}

export default Dividends
