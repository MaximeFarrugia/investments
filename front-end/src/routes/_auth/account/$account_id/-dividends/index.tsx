import { useMemo, useState } from 'react'
import { Route } from '..'
import { useQuery } from '@tanstack/react-query'
import { getDividends } from '@/api/portfolio'
import ApiError from '@/components/ApiError'
import Header from './header'
import RealDividends from './real_dividends'

const Dividends = () => {
  const { account_id } = Route.useParams()
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

  const currencies = useMemo(
    () => Array.from(new Set(dividends.map((e) => e.currency))),
    [dividends],
  )

  if (isPending) return <p>Loading Dividends...</p>

  if (error) return <ApiError error={error} />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      <Header
        className="col-span-full"
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        dividends={dividends}
        currencies={currencies}
      />
      <RealDividends dividends={dividends} currencies={currencies} />
    </div>
  )
}

export default Dividends
