import { useEffect, useMemo, useState } from 'react'
import { Route } from '.'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getOpenPositions } from '@/api/portfolio'
import ApiError from '@/components/ApiError'
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  PaginationNextButton,
  PaginationPreviousButton,
} from '@/components/ui/pagination'
import AnalysisCharts from '../../analysis/stock/-analysis_charts'

const OpenPositions = () => {
  const { account_id } = Route.useParams()
  const [symbol, setSymbol] = useState('')

  const {
    data,
    isPending,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['open_positions', account_id],
    queryFn: ({ pageParam }) =>
      getOpenPositions(account_id, { offset: pageParam, limit: 20 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.pagination.has_next) {
        return lastPage.data.pagination.offset + lastPage.data.pagination.limit
      }
      return null
    },
  })

  const openPositions = useMemo(
    () => data?.pages?.flatMap?.((e) => e.data.open_positions) ?? [],
    [data],
  )

  const idx = useMemo(
    () => openPositions.findIndex((e) => e.symbol === symbol),
    [openPositions, symbol],
  )

  useEffect(() => {
    if (openPositions.length && !symbol) {
      setSymbol(openPositions[0].symbol)
    }
  }, [openPositions, symbol, setSymbol])

  if (isPending) return <p>Loading Open Positions...</p>

  if (error) return <ApiError error={error} />

  return (
    <div className="flex flex-col gap-2">
      <Card>
        <CardHeader>
          <CardTitle>{symbol}</CardTitle>
          <CardAction className="flex flex-row gap-2">
            {idx > 0 && (
              <PaginationPreviousButton
                onClick={() => setSymbol(openPositions[idx - 1].symbol)}
              />
            )}
            {(idx + 1 < openPositions.length || hasNextPage) && (
              <PaginationNextButton
                onClick={() => {
                  if (
                    idx + 2 >= openPositions.length &&
                    hasNextPage &&
                    !isFetchingNextPage
                  ) {
                    fetchNextPage()
                  }
                  setSymbol(openPositions[idx + 1].symbol)
                }}
              />
            )}
          </CardAction>
        </CardHeader>
      </Card>
      {!!symbol && <AnalysisCharts symbol={symbol} />}
    </div>
  )
}

export default OpenPositions
