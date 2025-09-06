import { useState, type PropsWithChildren } from 'react'
import { stockAnalysisContext } from './context'
import HistoricalPrice from './HistoricalPrice'
import Dividends from './Dividends'
import Financials from './Financials'
import { usePrefetchQuery } from '@tanstack/react-query'
import { getFinancials } from '@/api/financial'
import Info from './Info'

interface Props {
  symbol: string
}

const StockAnalysis = ({ symbol, children }: PropsWithChildren<Props>) => {
  const [annual, setAnnual] = useState(true)

  usePrefetchQuery({
    queryKey: ['financials', symbol, annual],
    queryFn: () => getFinancials(symbol, annual),
  })

  return (
    <stockAnalysisContext.Provider value={{ symbol, annual, setAnnual }}>
      {children}
    </stockAnalysisContext.Provider>
  )
}

StockAnalysis.HistoricalPrice = HistoricalPrice
StockAnalysis.Dividends = Dividends
StockAnalysis.Financials = Financials
StockAnalysis.Info = Info

export default StockAnalysis
