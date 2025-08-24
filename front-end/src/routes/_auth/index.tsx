import { type Pagination } from '@/api'
import { listAccounts, type Account } from '@/api/portfolio'
import ApiError from '@/components/ApiError'
import TablePagination from '@/components/TablePagination'
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
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import z from 'zod'

const columnHelper = createColumnHelper<Account>()

const columns = [
  columnHelper.accessor('name', {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
    header: 'Name',
  }),
  columnHelper.accessor('platform', {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
    header: 'Platform',
  }),
]

function RouteComponent() {
  const [accountsPagination, setAccountsPagination] = useState<Pagination>({
    offset: 0,
    limit: 20,
  })
  const navigate = useNavigate()
  const { isPending, error, data } = useQuery({
    queryKey: [
      'list_accounts',
      accountsPagination.offset,
      accountsPagination.limit,
    ],
    queryFn: async () => await listAccounts(accountsPagination),
  })

  const table = useReactTable({
    data: data?.data.accounts ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isPending) return <p>Loading...</p>

  if (error) return <ApiError error={error} />

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
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
                  onClick={() => {
                    navigate({
                      to: '/account/$account_id',
                      params: { account_id: row.original._id.$oid },
                    })
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
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
            onChange={setAccountsPagination}
          />
        </CardFooter>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/_auth/')({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        offset: z.number().gte(0).catch(0),
        limit: z.number().gte(1).catch(20),
      })
      .parse(search),
})
