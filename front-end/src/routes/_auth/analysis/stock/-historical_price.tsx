import type { HistoricalPriceApiResponse } from '@/api/openbb'
import PopOutCard from '@/components/PopOutCard'
import StockAnalysis from '@/components/StockAnalysis'
import { CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useCallback } from 'react'
import { Brush, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import FallbackCard from './-fallback_card'

const HistoricalPrice = () => {
  const getStartIndex = useCallback(
    (data: HistoricalPriceApiResponse['results']) =>
      Math.max(
        0,
        data.findIndex(
          (e) =>
            new Date(e.date).getFullYear() === new Date().getFullYear() &&
            new Date(e.date).getMonth() === 0,
        ),
      ),
    [],
  )

  const getYtdReturn = useCallback(
    (data: HistoricalPriceApiResponse['results']) => {
      const sorted =
        data.sort((a, b) => +new Date(a.date) - +new Date(b.date)) ?? []
      if (!sorted.length) {
        return 0
      }
      const current = sorted[sorted.length - 1].close
      const beginning = sorted[getStartIndex(data)].close
      return parseFloat((((current - beginning) / beginning) * 100).toFixed(2))
    },
    [getStartIndex],
  )

  return (
    <FallbackCard title="Historical Price">
      <StockAnalysis.HistoricalPrice
        content={(data) => (
          <PopOutCard
            title="Historical Price"
            card={() => {
              const ytdReturn = getYtdReturn(data)

              return (
                <div className="flex flex-col gap-2">
                  <CardDescription>
                    YTD:{' '}
                    <span
                      className={
                        ytdReturn < 0 ? 'text-red-500' : 'text-green-500'
                      }
                    >
                      {ytdReturn}%
                    </span>
                  </CardDescription>
                  <ChartContainer config={{}}>
                    <LineChart data={data.slice(getStartIndex(data))}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Line dataKey="close" dot={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </LineChart>
                  </ChartContainer>
                </div>
              )
            }}
            dialog={() => {
              const ytdReturn = getYtdReturn(data)

              return (
                <div className="flex flex-col gap-2">
                  <CardDescription>
                    YTD:{' '}
                    <span
                      className={
                        ytdReturn < 0 ? 'text-red-500' : 'text-green-500'
                      }
                    >
                      {ytdReturn}%
                    </span>
                  </CardDescription>
                  <ChartContainer config={{}}>
                    <LineChart data={data}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} />
                      <Line dataKey="close" dot={false} />
                      <Brush
                        dataKey="date"
                        startIndex={getStartIndex(data)}
                        height={20}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </LineChart>
                  </ChartContainer>
                </div>
              )
            }}
          />
        )}
      />
    </FallbackCard>
  )
}

export default HistoricalPrice
