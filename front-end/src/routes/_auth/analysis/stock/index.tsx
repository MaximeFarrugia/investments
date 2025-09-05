import ErrorInfo from '@/components/form/ErrorInfo'
import SubmitButton from '@/components/form/SubmitButton'
import TextField from '@/components/form/TextField'
import StockAnalysis from '@/components/StockAnalysis'
import { CardTitle } from '@/components/ui/card'
import { fieldContext, formContext } from '@/hooks/form_context'
import { createFormHook } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import z from 'zod'
import HistoricalPrice from './-historical_price'
import Dividends from './-dividends'
import { stockAnalysisContext } from '@/components/StockAnalysis/context'
import { Button } from '@/components/ui/button'
import Financials from './-financials'

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    ErrorInfo,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { symbol } = Route.useSearch()

  const form = useAppForm({
    defaultValues: {
      symbol: symbol ?? '',
    },
    validators: {
      onChange: z.object({
        symbol: z.string().nonempty(),
      }),
    },
    onSubmit: ({ value }) => {
      navigate({
        to: Route.fullPath,
        search: {
          symbol: value.symbol,
        },
        replace: true,
      })
    },
  })

  return (
    <div className="p-4 flex flex-col gap-4">
      <CardTitle>Stock Analysis</CardTitle>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.AppField
          name="symbol"
          children={(field) => (
            <div>
              <div className="flex items-end gap-2">
                <field.TextField
                  label="Symbol"
                  placeholder="AAPL"
                  className="w-[100px]"
                />
                <form.AppForm>
                  <form.SubmitButton label="Go" />
                </form.AppForm>
              </div>
              <field.ErrorInfo />
            </div>
          )}
        />
      </form>
      {!!symbol && (
        <StockAnalysis symbol={symbol}>
          <stockAnalysisContext.Consumer>
            {(context) =>
              !!context && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => context.setAnnual(true)}
                    variant={context.annual ? 'default' : 'outline'}
                  >
                    Annual
                  </Button>
                  <Button
                    onClick={() => context.setAnnual(false)}
                    variant={context.annual ? 'outline' : 'default'}
                  >
                    Quarterly
                  </Button>
                </div>
              )
            }
          </stockAnalysisContext.Consumer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <HistoricalPrice />
            <Dividends />
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
                share_based_comp: [
                  {
                    concept: 'us-gaap:ShareBasedCompensation',
                    label: 'Share Based Compensation',
                    color: 'var(--color-violet-500)',
                  },
                ],
              }}
            />
          </div>
        </StockAnalysis>
      )}
    </div>
  )
}

export const Route = createFileRoute('/_auth/analysis/stock/')({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        symbol: z.string().optional(),
      })
      .parse(search),
})
