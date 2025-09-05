import { useState } from 'react'
import { Route } from '.'
import type { Pagination } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { getOpenPositions, type OpenPosition } from '@/api/portfolio'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import ApiError from '@/components/ApiError'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import TablePagination from '@/components/TablePagination'
import { useNavigate } from '@tanstack/react-router'

const columnHelper = createColumnHelper<OpenPosition>()

const columns = [
  columnHelper.accessor('symbol', {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
    header: 'Symbol',
  }),
  columnHelper.accessor('quantity', {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
    header: 'Quantity',
  }),
  columnHelper.accessor('cost_price', {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
    header: 'Cost Price',
  }),
  columnHelper.accessor('currency', {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
    header: 'Currency',
  }),
]

const OpenPositions = () => {
  const navigate = useNavigate()
  const { account_id } = Route.useParams()
  const [pagination, setPagination] = useState<Pagination>({
    offset: 0,
    limit: 20,
  })
  const { isPending, error, data } = useQuery({
    queryKey: [
      'open_positions',
      account_id,
      pagination.offset,
      pagination.limit,
    ],
    queryFn: async () => await getOpenPositions(account_id, pagination),
  })

  const table = useReactTable({
    data: data?.data.open_positions ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isPending) return <p>Loading Open Positions...</p>

  if (error) return <ApiError error={error} />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() =>
                  navigate({
                    to: '/analysis/stock',
                    search: {
                      symbol: row.original.symbol,
                    },
                  })
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <TablePagination
          pagination={data.data.pagination}
          onChange={setPagination}
        />
      </CardFooter>
    </Card>
  )
}

export default OpenPositions
