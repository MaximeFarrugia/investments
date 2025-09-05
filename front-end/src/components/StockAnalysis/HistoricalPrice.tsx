import { useQuery } from '@tanstack/react-query'
import ApiError from '../ApiError'
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
  const { isPending, error, data } = useQuery({
    queryKey: ['historical_price', symbol],
    queryFn: () => getHistoricalPrice(symbol),
  })

  if (isPending) {
    return <p>Loading historical price...</p>
  }

  if (error) {
    return <ApiError error={error} />
  }

  return content(data.data.results)
}

export default HistoricalPrice
