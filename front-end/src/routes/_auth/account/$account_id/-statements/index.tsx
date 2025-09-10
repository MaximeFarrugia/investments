import { type Pagination } from '@/api'
import {
  deleteStatement,
  listStatements,
  newStatement,
  type NewStatementPayload,
  type Statement,
} from '@/api/portfolio'
import ApiError from '@/components/ApiError'
import ErrorInfo from '@/components/form/ErrorInfo'
import SubmitButton from '@/components/form/SubmitButton'
import TablePagination from '@/components/TablePagination'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fieldContext, formContext } from '@/hooks/form_context'
import { DialogDescription } from '@radix-ui/react-dialog'
import { createFormHook } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row,
} from '@tanstack/react-table'
import { useCallback, useState } from 'react'
import z from 'zod'
import { Route } from '..'
import { EllipsisVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ActionButton = ({ row }: { row: Row<Statement> }) => {
  const queryClient = useQueryClient()
  const [dialogVisible, setDialogVisible] = useState(false)
  const [dialogError, setDialogError] = useState<Error | undefined>()

  const deleteStatementMutation = useMutation({
    mutationFn: (vars: { account_id: string; statement_id: string }) =>
      deleteStatement(vars.account_id, vars.statement_id),
  })

  const handleDelete = useCallback(async () => {
    try {
      await deleteStatementMutation.mutateAsync({
        account_id: row.original.account_id,
        statement_id: row.original.id,
      })
      await queryClient.refetchQueries({
        predicate: (query) => query.queryKey[0] === 'list_statements',
      })
      setDialogVisible(false)
    } catch (err) {
      setDialogError(err as Error)
    }
  }, [row, deleteStatementMutation, queryClient])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <Dialog
        open={dialogVisible}
        onOpenChange={(open) => {
          setDialogVisible(open)
          setDialogError(undefined)
        }}
      >
        <DropdownMenuContent align="end">
          <DialogTrigger asChild>
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete statement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this statement?
            </DialogDescription>
          </DialogHeader>
          {!!dialogError && <ApiError error={dialogError!} />}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}

const columnHelper = createColumnHelper<Statement>()

const columns = [
  columnHelper.accessor('start', {
    cell: (info) => {
      const date = new Date(info.getValue())
      return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
    },
    footer: (info) => info.column.id,
    header: 'Start',
  }),
  columnHelper.accessor('end', {
    cell: (info) => {
      const date = new Date(info.getValue())
      return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
    },
    footer: (info) => info.column.id,
    header: 'End',
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => (
      <div className="w-full flex justify-end">
        <ActionButton row={row} />
      </div>
    ),
  }),
]

const { useAppForm } = createFormHook({
  fieldComponents: {
    ErrorInfo,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})

const Statements = () => {
  const { account_id } = Route.useParams()
  const [pagination, setPagination] = useState<Pagination>({
    offset: 0,
    limit: 20,
  })
  const [dialogError, setDialogError] = useState<Error | undefined>()
  const [dialogVisible, setDialogVisible] = useState(false)

  const { isPending, error, data, refetch } = useQuery({
    queryKey: [
      'list_statements',
      account_id,
      pagination.offset,
      pagination.limit,
    ],
    queryFn: () => listStatements(account_id, pagination),
  })

  const newStatementMutation = useMutation({
    mutationFn: (value: NewStatementPayload) => newStatement(value),
  })

  const form = useAppForm({
    defaultValues: {
      file: null as File | null,
    },
    validators: {
      onChange: z.object({
        file: z.file(),
      }),
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        await newStatementMutation.mutateAsync({
          file: value.file!,
          account_id,
        })
        await refetch()
        formApi.reset()
        setDialogVisible(false)
      } catch (err) {
        setDialogError(err as Error)
      }
    },
  })

  const table = useReactTable({
    data: data?.data.statements ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isPending) return <p>Loading...</p>

  if (error) return <ApiError error={error} />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statements</CardTitle>
        <CardAction>
          <Dialog
            open={dialogVisible}
            onOpenChange={(open) => {
              setDialogVisible(open)
              setDialogError(undefined)
            }}
          >
            <DialogTrigger asChild>
              <Button>Upload statement</Button>
            </DialogTrigger>
            <DialogContent>
              <form
                className="contents"
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}
              >
                <DialogHeader>
                  <DialogTitle>Upload Statement</DialogTitle>
                  <DialogDescription>
                    Select file to upload new statement.
                  </DialogDescription>
                </DialogHeader>
                <form.AppField
                  name="file"
                  children={(field) => (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="file" className="px-1">
                        File
                      </Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) =>
                          field.handleChange(e.target.files?.[0] ?? null)
                        }
                      />
                      <field.ErrorInfo />
                    </div>
                  )}
                />
                {!!dialogError && <ApiError error={dialogError!} />}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <form.AppForm>
                    <form.SubmitButton label="Submit" />
                  </form.AppForm>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
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
              <TableRow key={row.id}>
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

export default Statements
