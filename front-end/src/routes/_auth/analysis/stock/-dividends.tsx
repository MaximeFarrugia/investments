import type { HistoricalDividendsApiResponse } from '@/api/openbb'
import PopOutCard from '@/components/PopOutCard'
import StockAnalysis from '@/components/StockAnalysis'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useCallback } from 'react'
import {
  Brush,
  CartesianGrid,
  Bar,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
} from 'recharts'
import { CardDescription } from '@/components/ui/card'

const Dividends = () => {
  const getStartIndex = useCallback(
    (data: HistoricalDividendsApiResponse['results']) =>
      Math.max(
        0,
        data
          .sort(
            (a, b) =>
              +new Date(a.ex_dividend_date) - +new Date(b.ex_dividend_date),
          )
          .findIndex(
            (e) =>
              new Date(e.ex_dividend_date).getFullYear() ===
              new Date().getFullYear() - 10,
          ),
      ),
    [],
  )

  return (
    <StockAnalysis.Dividends
      content={(data) => (
        <PopOutCard
          title="Dividends"
          card={() => (
            <div className="flex flex-col gap-2">
              <CardDescription className="flex flex-col gap-2">
                <span>Provider: Yahoo Finance</span>
              </CardDescription>
              <ChartContainer config={{}} className="w-full">
                <ComposedChart data={data.slice(getStartIndex(data))}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="ex_dividend_date" hide />
                  <YAxis yAxisId="left" dataKey="amount" domain={['auto', 'auto']} hide />
                  <YAxis
                    yAxisId="right"
                    dataKey="growth_percent"
                    orientation="right"
                    hide
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar yAxisId="left" dataKey="amount" fill="var(--color-lime-400)" />
                  <Line yAxisId="right" dataKey="growth_percent" connectNulls />
                </ComposedChart>
              </ChartContainer>
            </div>
          )}
          dialog={() => (
            <div className="flex flex-col gap-2">
              <CardDescription className="flex flex-col gap-2">
                <span>Provider: Yahoo Finance</span>
              </CardDescription>
              <ChartContainer config={{}} className="w-full">
                <ComposedChart data={data}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="ex_dividend_date" />
                  <YAxis yAxisId="left" dataKey="amount" domain={['auto', 'auto']} />
                  <YAxis
                    yAxisId="right"
                    dataKey="growth_percent"
                    orientation="right"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar yAxisId="left" dataKey="amount" fill="var(--color-lime-400)" />
                  <Line yAxisId="right" dataKey="growth_percent" connectNulls />
                  <Brush dataKey="ex_dividend_date" height={20} />
                </ComposedChart>
              </ChartContainer>
            </div>
          )}
        />
      )}
    />
  )
}

export default Dividends
