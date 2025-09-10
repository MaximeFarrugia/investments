import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DividendsChart from './dividends_chart'
import type { Dividend } from '@/api/portfolio'
import { useEffect, useMemo, useState } from 'react'
import { Switch } from '@/components/ui/switch'

interface Props {
  className?: string
  dividends: Dividend[]
  currencies: string[]
}

const RealDividends = ({ className, dividends, currencies }: Props) => {
  const [currency, setCurrency] = useState('')
  const [monthly, setMonthly] = useState(true)

  const chartData = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {}

    dividends
      .filter((e) => e.currency === currency)
      .forEach((dividend) => {
        const dateKey = monthly
          ? dividend.date.slice(0, dividend.date.lastIndexOf('-'))
          : dividend.date.slice(0, dividend.date.indexOf('-'))
        if (!grouped[dateKey]) {
          grouped[dateKey] = {}
        }
        const divAmount =
          (grouped[dateKey][dividend.symbol] ?? 0) + parseFloat(dividend.amount)
        grouped[dateKey][dividend.symbol] = divAmount
      })

    return Object.entries(grouped)
      .reduce(
        (acc, [date, e], idx) => {
          const total = Object.values(e).reduce((acc, curr) => acc + curr, 0)
          return [
            ...acc,
            {
              date,
              total,
              growth_percent:
                idx === 0 || monthly
                  ? undefined
                  : ((total - acc[acc.length - 1].total) /
                      acc[acc.length - 1].total) *
                    100,
              ...e,
            },
          ] as Array<
            {
              date: string
              total: number
              growth_percent?: number
            } & Record<string, number>
          >
        },
        [] as Array<
          {
            date: string
            total: number
            growth_percent?: number
          } & Record<string, number>
        >,
      )
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
  }, [dividends, currency, monthly])

  const symbols = useMemo(
    () =>
      Array.from(
        new Set(
          dividends.filter((e) => e.currency === currency).map((e) => e.symbol),
        ),
      ),
    [dividends, currency],
  )

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

  return (
    <Card className={className}>
      <CardHeader>
        <CardDescription className="flex flex-wrap items-center justify-between gap-4">
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
          <div className="flex items-center gap-2">
            <span>Yearly</span>
            <Switch checked={monthly} onCheckedChange={setMonthly} />
            <span>Monthly</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DividendsChart chartData={chartData} symbols={symbols} />
      </CardContent>
    </Card>
  )
}

export default RealDividends
