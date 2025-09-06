import type { HistoricalDividendsApiResponse } from '@/api/openbb'
import PopOutCard from '@/components/PopOutCard'
import StockAnalysis from '@/components/StockAnalysis'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useCallback } from 'react'
import { Brush, CartesianGrid, Bar, BarChart, XAxis, YAxis } from 'recharts'
import FallbackCard from './-fallback_card'
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
    <FallbackCard title="Dividends">
      <StockAnalysis.Dividends
        content={(data) => (
          <PopOutCard
            title="Dividends"
            card={() => (
              <div className="flex flex-col gap-2">
                <CardDescription className="flex flex-col gap-2">
                  <span>Provider: Yahoo Finance</span>
                </CardDescription>
                <ChartContainer config={{}}>
                  <BarChart data={data.slice(getStartIndex(data))}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="ex_dividend_date" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="var(--color-lime-400)" />
                  </BarChart>
                </ChartContainer>
              </div>
            )}
            dialog={() => (
              <div className="flex flex-col gap-2">
                <CardDescription className="flex flex-col gap-2">
                  <span>Provider: Yahoo Finance</span>
                </CardDescription>
                <ChartContainer config={{}}>
                  <BarChart data={data}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="ex_dividend_date" />
                    <YAxis domain={['auto', 'auto']} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="var(--color-lime-400)" />
                    <Brush dataKey="ex_dividend_date" height={20} />
                  </BarChart>
                </ChartContainer>
              </div>
            )}
          />
        )}
      />
    </FallbackCard>
  )
}

export default Dividends
