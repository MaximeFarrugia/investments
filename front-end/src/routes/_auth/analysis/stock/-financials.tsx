import PopOutCard from '@/components/PopOutCard'
import StockAnalysis from '@/components/StockAnalysis'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Brush, CartesianGrid, Bar, BarChart, XAxis, YAxis } from 'recharts'
import { getBarMap, initHiddenBars, moneyAmountFormatter } from './-utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  concepts: Record<
    string,
    Array<{ concept: string; label: string; color: string }>
  >
  title: string
}

const Financials = ({ concepts, title }: Props) => {
  const [hiddenBars, setHiddenBars] = useState(initHiddenBars(concepts))

  return (
    <StockAnalysis.Financials
      concepts={concepts}
      content={(data) => (
        <PopOutCard
          title={title}
          card={() => (
            <ChartContainer config={{}}>
              <BarChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="fpy" hide />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={moneyAmountFormatter}
                  hide
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                {getBarMap(concepts).map((e) => (
                  <Bar
                    key={e.concept}
                    dataKey={e.label}
                    stackId={e.category}
                    fill={e.color}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          )}
          dialog={() => (
            <div className="flex flex-col gap-2">
              {Object.keys(concepts).length > 1 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(hiddenBars).map(([category, hidden]) => (
                    <Button
                      key={category}
                      variant={hidden ? 'outline' : 'default'}
                      onClick={() =>
                        setHiddenBars((e) => ({
                          ...e,
                          [category]: !e[category as keyof typeof hiddenBars],
                        }))
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              )}
              <ChartContainer config={{}}>
                <BarChart data={data}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="fpy" />
                  <YAxis
                    domain={['auto', 'auto']}
                    tickFormatter={moneyAmountFormatter}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {getBarMap(concepts).map((e) => (
                    <Bar
                      key={e.concept}
                      dataKey={e.label}
                      stackId={e.category}
                      fill={e.color}
                      hide={hiddenBars[e.label]}
                    />
                  ))}
                  <Brush dataKey="fpy" height={20} />
                </BarChart>
              </ChartContainer>
            </div>
          )}
        />
      )}
    />
  )
}

export default Financials
