import type { Dividend } from '@/api/portfolio'
import DatePicker from '@/components/DatePicker'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { useMemo } from 'react'

interface Props {
  className?: string
  startDate: Date
  setStartDate: (date: Date) => void
  endDate: Date
  setEndDate: (date: Date) => void
  dividends: Dividend[]
  currencies: string[]
}

const Header = ({
  className,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  dividends,
  currencies,
}: Props) => {
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardDescription className="flex flex-wrap items-center gap-2">
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
        <CardDescription className="flex flex-wrap gap-2">
          <div className="flex flex-col gap-2">
            <span>Totals</span>
            {Object.entries(totalDividends).map(([k, v]) => (
              <Badge key={k}>{`${k}: ${v}`}</Badge>
            ))}
          </div>
        </CardDescription>
      </CardContent>
    </Card>
  )
}

export default Header
