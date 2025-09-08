import { useStockAnalysis } from '@/components/StockAnalysis/context'
import { Button } from '@/components/ui/button'
import HistoricalPrice from './-historical_price'
import Dividends from './-dividends'
import Financials from './-financials'
import Info from './-info'
import FallbackCard from './-fallback_card'
import {
  clearStockAnalysisDataCache,
  preloadStockAnalysisData,
} from '@/components/StockAnalysis/utils'
import { useQueryClient } from '@tanstack/react-query'

const AnalysisCharts = () => {
  const queryClient = useQueryClient()
  const { symbol, annual, setAnnual } = useStockAnalysis()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          onClick={() => {
            clearStockAnalysisDataCache(queryClient, symbol, false)
            preloadStockAnalysisData(queryClient, symbol, true)
            setAnnual(true)
          }}
          variant={annual ? 'default' : 'outline'}
        >
          Annual
        </Button>
        <Button
          onClick={() => {
            clearStockAnalysisDataCache(queryClient, symbol, true)
            preloadStockAnalysisData(queryClient, symbol, false)
            setAnnual(false)
          }}
          variant={annual ? 'outline' : 'default'}
        >
          Quarterly
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Info className="col-span-full" />
        <FallbackCard title="Historical Price">
          <HistoricalPrice />
        </FallbackCard>
        <FallbackCard title="Dividends">
          <Dividends />
        </FallbackCard>
        <FallbackCard title="Financials">
          <Financials
            title="Revenue"
            concepts={{
              revenue: [
                {
                  concept:
                    'us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax',
                  label: 'Revenue',
                  color: 'var(--color-amber-400)',
                },
                {
                  concept: 'us-gaap:Revenues',
                  label: 'Revenue',
                  color: 'var(--color-amber-400)',
                },
                {
                  concept: 'us-gaap:SalesRevenueNet',
                  label: 'Revenue',
                  color: 'var(--color-amber-400)',
                },
              ],
            }}
          />
          <Financials
            title="Net Income"
            concepts={{
              net_income: [
                {
                  concept: 'us-gaap:NetIncomeLoss',
                  label: 'Net Income',
                  color: 'var(--color-orange-300)',
                },
              ],
            }}
          />
          <Financials
            title="EPS"
            concepts={{
              eps: [
                {
                  concept: 'us-gaap:EarningsPerShareDiluted',
                  label: 'EPS',
                  color: 'var(--color-yellow-300)',
                },
              ],
            }}
          />
          <Financials
            title="Shares Outstanding"
            concepts={{
              shares_outstanding: [
                {
                  concept: 'us-gaap:CommonStockSharesOutstanding',
                  label: 'Shares Outstanding',
                  color: 'var(--color-teal-600)',
                },
                {
                  concept: 'dei:EntityCommonStockSharesOutstanding',
                  label: 'Shares Outstanding',
                  color: 'var(--color-teal-600)',
                },
              ],
            }}
          />
          <Financials
            title="Cash & Debt"
            concepts={{
              cash: [
                {
                  concept: 'us-gaap:CashAndCashEquivalentsAtCarryingValue',
                  label: 'Cash',
                  color: 'var(--color-green-400)',
                },
              ],
              debt: [
                {
                  concept: 'us-gaap:LongTermDebtNoncurrent',
                  label: 'Long Term Debt',
                  color: 'var(--color-red-500)',
                },
                {
                  concept: 'us-gaap:LongTermDebtCurrent',
                  label: 'Short Term Debt',
                  color: 'var(--color-red-400)',
                },
              ],
            }}
          />
          <Financials
            title="Free Cash Flow"
            concepts={{
              free_cash_flow: [
                {
                  concept:
                    'calc(sub(us-gaap:NetCashProvidedByUsedInOperatingActivities, us-gaap:PaymentsToAcquirePropertyPlantAndEquipment))',
                  label: 'Free Cash Flow',
                  color: 'var(--color-orange-500)',
                },
              ],
              share_based_comp: [
                {
                  concept: 'us-gaap:ShareBasedCompensation',
                  label: 'Share Based Compensation',
                  color: 'var(--color-violet-500)',
                },
                {
                  concept: 'us-gaap:AllocatedShareBasedCompensationExpense',
                  label: 'Share Based Compensation',
                  color: 'var(--color-violet-500)',
                },
              ],
            }}
          />
        </FallbackCard>
      </div>
    </div>
  )
}

export default AnalysisCharts
