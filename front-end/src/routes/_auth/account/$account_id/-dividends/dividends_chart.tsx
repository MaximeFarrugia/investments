import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useMemo } from 'react'
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'

interface Props {
  chartData: Array<
    {
      date: string
      total: number
      growth_percent?: number
    } & Record<string, number>
  >
  symbols: string[]
}

const DividendsChart = ({ chartData, symbols }: Props) => {
  const showGrowth = useMemo(
    () => chartData.some((e) => e.growth_percent !== undefined),
    [chartData],
  )

  return (
    <ChartContainer config={{}} className="w-full">
      <ComposedChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation='right' hide={!showGrowth} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {symbols.map((e, idx) => (
          <Bar
            key={e}
            yAxisId="left"
            dataKey={e}
            stackId="a"
            fill={colors[idx % colors.length]}
          />
        ))}
        <Line yAxisId="left" dataKey="total" />
        <Line
          yAxisId="right"
          dataKey="growth_percent"
          name="Growth %"
          stroke="var(--color-purple-300)"
          hide={!showGrowth}
          connectNulls
        />
      </ComposedChart>
    </ChartContainer>
  )
}

export default DividendsChart

const colors = [
  'oklch(0.704 0.191 22.216)',
  'oklch(0.637 0.237 25.331)',
  'oklch(0.577 0.245 27.325)',
  'oklch(0.505 0.213 27.518)',
  'oklch(0.75 0.183 55.934)',
  'oklch(0.705 0.213 47.604)',
  'oklch(0.646 0.222 41.116)',
  'oklch(0.553 0.195 38.402)',
  'oklch(0.828 0.189 84.429)',
  'oklch(0.769 0.188 70.08)',
  'oklch(0.666 0.179 58.318)',
  'oklch(0.555 0.163 48.998)',
  'oklch(0.852 0.199 91.936)',
  'oklch(0.795 0.184 86.047)',
  'oklch(0.681 0.162 75.834)',
  'oklch(0.554 0.135 66.442)',
  'oklch(0.841 0.238 128.85)',
  'oklch(0.768 0.233 130.85)',
  'oklch(0.648 0.2 131.684)',
  'oklch(0.532 0.157 131.589)',
  'oklch(0.792 0.209 151.711)',
  'oklch(0.723 0.219 149.579)',
  'oklch(0.627 0.194 149.214)',
  'oklch(0.527 0.154 150.069)',
  'oklch(0.765 0.177 163.223)',
  'oklch(0.696 0.17 162.48)',
  'oklch(0.596 0.145 163.225)',
  'oklch(0.508 0.118 165.612)',
  'oklch(0.777 0.152 181.912)',
  'oklch(0.704 0.14 182.503)',
  'oklch(0.6 0.118 184.704)',
  'oklch(0.511 0.096 186.391)',
  'oklch(0.789 0.154 211.53)',
  'oklch(0.715 0.143 215.221)',
  'oklch(0.609 0.126 221.723)',
  'oklch(0.52 0.105 223.128)',
  'oklch(0.746 0.16 232.661)',
  'oklch(0.685 0.169 237.323)',
  'oklch(0.588 0.158 241.966)',
  'oklch(0.5 0.134 242.749)',
  'oklch(0.707 0.165 254.624)',
  'oklch(0.623 0.214 259.815)',
  'oklch(0.546 0.245 262.881)',
  'oklch(0.488 0.243 264.376)',
  'oklch(0.673 0.182 276.935)',
  'oklch(0.585 0.233 277.117)',
  'oklch(0.511 0.262 276.966)',
  'oklch(0.457 0.24 277.023)',
  'oklch(0.702 0.183 293.541)',
  'oklch(0.606 0.25 292.717)',
  'oklch(0.541 0.281 293.009)',
  'oklch(0.491 0.27 292.581)',
  'oklch(0.714 0.203 305.504)',
  'oklch(0.627 0.265 303.9)',
  'oklch(0.558 0.288 302.321)',
  'oklch(0.496 0.265 301.924)',
  'oklch(0.74 0.238 322.16)',
  'oklch(0.667 0.295 322.15)',
  'oklch(0.591 0.293 322.896)',
  'oklch(0.518 0.253 323.949)',
  'oklch(0.718 0.202 349.761)',
  'oklch(0.656 0.241 354.308)',
  'oklch(0.592 0.249 0.584)',
  'oklch(0.525 0.223 3.958)',
  'oklch(0.712 0.194 13.428)',
  'oklch(0.645 0.246 16.439)',
  'oklch(0.586 0.253 17.585)',
  'oklch(0.514 0.222 16.935)',
]
