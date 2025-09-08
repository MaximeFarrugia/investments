import { useSuspenseQuery } from '@tanstack/react-query'
import {
  getHistoricalPrice,
  type HistoricalPriceApiResponse,
} from '@/api/openbb'
import { useStockAnalysis } from './context'

interface Props {
  content: (data: HistoricalPriceApiResponse['results']) => React.ReactNode
}

const HistoricalPrice = ({ content }: Props) => {
  const { symbol } = useStockAnalysis()
  const { data } = useSuspenseQuery({
    queryKey: ['historical_price', symbol],
    queryFn: () => getHistoricalPrice(symbol),
    staleTime: 30 * 1000,
  })

  return content(data.data.results ?? [])
}

export default HistoricalPrice
