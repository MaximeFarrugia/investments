import { useEffect, useMemo, useState } from 'react'
import { Route } from '.'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getOpenPositions } from '@/api/portfolio'
import ApiError from '@/components/ApiError'
import AnalysisCharts from '../../analysis/stock/-analysis_charts'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

const OpenPositions = () => {
  const { account_id } = Route.useParams()
  const [symbol, setSymbol] = useState('')
  const [open, setOpen] = useState(false)

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

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const openPositions = useMemo(
    () => data?.pages?.flatMap?.((e) => e.data.open_positions) ?? [],
    [data],
  )

  if (isPending) return <p>Loading Open Positions...</p>

  if (error) return <ApiError error={error} />

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            className="w-[200px] justify-between"
            variant="outline"
            role="combobox"
            aria-expanded={open}
          >
            {symbol || 'Symbol'}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search symbol..." className="h-9" />
            <CommandList>
              <CommandEmpty>No symbol found.</CommandEmpty>
              <CommandGroup>
                {openPositions.map((e) => (
                  <CommandItem
                    key={e.id}
                    value={e.symbol}
                    onSelect={(s) => {
                      setSymbol(s)
                      setOpen(false)
                    }}
                  >
                    {e.symbol}
                    <Check
                      className={cn(
                        'ml-auto',
                        symbol === e.symbol ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {!!symbol && <AnalysisCharts symbol={symbol} />}
    </div>
  )
}

export default OpenPositions
