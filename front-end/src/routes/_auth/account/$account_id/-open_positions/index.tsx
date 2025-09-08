import { useState } from 'react'
import SymbolSelect from './symbol_select'
import StockAnalysis from '@/components/StockAnalysis'
import AnalysisCharts from '@/routes/_auth/analysis/stock/-analysis_charts'

const OpenPositions = () => {
  const [symbol, setSymbol] = useState('')

  return (
    <div className="flex flex-col gap-2">
      <StockAnalysis symbol={symbol}>
        <SymbolSelect onSelect={setSymbol} />
        {!!symbol && <AnalysisCharts />}
      </StockAnalysis>
    </div>
  )
}

export default OpenPositions
