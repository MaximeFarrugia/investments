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
import { useEffect, useMemo, useState } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { getOpenPositions } from '@/api/portfolio'
import { Route } from '..'
import { useStockAnalysis } from '@/components/StockAnalysis/context'
import {
  clearStockAnalysisDataCache,
  preloadStockAnalysisData,
} from '@/components/StockAnalysis/utils'

interface Props {
  onSelect: (value: string) => void
}

const SymbolSelect = ({ onSelect }: Props) => {
  const { account_id } = Route.useParams()
  const { symbol, annual } = useStockAnalysis()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['open_positions', account_id],
      queryFn: ({ pageParam }) =>
        getOpenPositions(account_id, { offset: pageParam, limit: 20 }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.data.pagination.has_next) {
          return (
            lastPage.data.pagination.offset + lastPage.data.pagination.limit
          )
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
  return (
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
                    clearStockAnalysisDataCache(queryClient, symbol, annual)
                    preloadStockAnalysisData(queryClient, s, annual)

                    onSelect(s)
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
  )
}

export default SymbolSelect
