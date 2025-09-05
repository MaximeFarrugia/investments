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
            <ChartContainer config={{}}>
              <BarChart data={data.slice(getStartIndex(data))}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="ex_dividend_date" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="var(--color-lime-400)" />
              </BarChart>
            </ChartContainer>
          )}
          dialog={() => (
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
          )}
        />
      )}
    />
  )
}

export default Dividends
