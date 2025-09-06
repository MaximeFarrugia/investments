import { useEffect, useMemo, useState } from 'react'
import { Route } from '.'
import { useQuery } from '@tanstack/react-query'
import { getDividends } from '@/api/portfolio'
import ApiError from '@/components/ApiError'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DatePicker from '@/components/DatePicker'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const Dividends = () => {
  const { account_id } = Route.useParams()
  const [currency, setCurrency] = useState('')
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0),
  )
  const [endDate, setEndDate] = useState(
    new Date(new Date().getFullYear() + 1, 0),
  )
  const { data, error, isPending } = useQuery({
    queryKey: ['dividends', account_id, startDate, endDate],
    queryFn: () => {
      return getDividends(account_id, {
        start_date: startDate,
        end_date: endDate,
      })
    },
  })

  const dividends = useMemo(() => data?.data.dividends ?? [], [data])

  const symbols = useMemo(
    () =>
      Array.from(
        new Set(
          dividends.filter((e) => e.currency === currency).map((e) => e.symbol),
        ),
      ),
    [dividends, currency],
  )
  const currencies = useMemo(
    () => Array.from(new Set(dividends.map((e) => e.currency))),
    [dividends],
  )

  const chartData = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {}

    dividends
      .filter((e) => e.currency === currency)
      .forEach((dividend) => {
        const dateKey = dividend.date.slice(0, dividend.date.lastIndexOf('-'))
        if (!grouped[dateKey]) {
          grouped[dateKey] = {}
        }
        const divAmount =
          (grouped[dateKey][dividend.symbol] ?? 0) + parseFloat(dividend.amount)
        grouped[dateKey][dividend.symbol] = divAmount
      })

    return Object.entries(grouped).map(([date, e]) => ({
      date,
      total: Object.values(e).reduce((acc, curr) => acc + curr, 0),
      ...e,
    }))
  }, [dividends, currency])

  useEffect(() => {
    const max = {
      currency: '',
      count: 0,
    }
    currencies.forEach((c) => {
      const count = dividends.filter((d) => d.currency === c).length
      if (count > max.count) {
        max.currency = c
        max.count = count
      }
    })
    setCurrency(max.currency)
  }, [dividends, currencies, setCurrency])

  const totalDividends: Record<string, number> = useMemo(
    () =>
      currencies.reduce(
        (acc, curr) => ({
          ...acc,
          [curr]: Math.round(
            dividends
              .filter((d) => d.currency === curr)
              .reduce((acc1, curr1) => acc1 + parseFloat(curr1.amount), 0),
          ),
        }),
        {},
      ),
    [dividends, currencies],
  )

  if (isPending) return <p>Loading Dividends...</p>

  if (error) return <ApiError error={error} />

  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="currency" className="px-1">
              Currency
            </Label>
            <Select onValueChange={setCurrency} value={currency}>
              <SelectTrigger id="currency" className="w-[120px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DatePicker
            label="Start date"
            date={startDate}
            onSelect={(date) => {
              if (date) {
                setStartDate(date)
              }
            }}
          />
          <DatePicker
            label="End date"
            date={endDate}
            onSelect={(date) => {
              if (date) {
                setEndDate(date)
              }
            }}
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="w-full">
          <ComposedChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {symbols.map((e, idx) => (
              <Bar
                key={e}
                dataKey={e}
                stackId="a"
                fill={colors[idx % colors.length]}
              />
            ))}
            <Line dataKey="total" />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <CardDescription className="flex flex-wrap gap-2 justify-center w-full">
          {Object.entries(totalDividends).map(([k, v]) => (
            <Badge key={k}>{`${k}: ${v}`}</Badge>
          ))}
        </CardDescription>
      </CardFooter>
    </Card>
  )
}

export default Dividends

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
