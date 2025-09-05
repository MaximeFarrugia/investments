import { createContext, useContext } from 'react'

export interface StockAnalysisContext {
  symbol: string
  annual: boolean
  setAnnual: (annual: boolean) => unknown
}

export const stockAnalysisContext = createContext<
  StockAnalysisContext | undefined
>(undefined)

export const useStockAnalysis = () => {
  const context = useContext(stockAnalysisContext)
  if (context === undefined) {
    throw new Error(
      'useStockAnalysis must be within <stockAnalysisContext.Provider />',
    )
  }
  return context
}
