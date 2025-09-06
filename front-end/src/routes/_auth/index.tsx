import { type Pagination } from '@/api'
import {
  listAccounts,
  newAccount,
  type Account,
  type NewAccountPayload,
  type Platform,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { useMutation, useQuery } from '@tanstack/react-query'
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

const { useAppForm } = createFormHook({
  fieldComponents: {
    Select,
    ErrorInfo,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})

function RouteComponent() {
  const [accountsPagination, setAccountsPagination] = useState<Pagination>({
    offset: 0,
    limit: 20,
  })
  const [dialogError, setDialogError] = useState<Error | undefined>()
  const [dialogVisible, setDialogVisible] = useState(false)
  const navigate = useNavigate()

  const { isPending, error, data, refetch } = useQuery({
    queryKey: [
      'list_accounts',
      accountsPagination.offset,
      accountsPagination.limit,
    ],
    queryFn: () => listAccounts(accountsPagination),
  })

  const newAccountMutation = useMutation({
    mutationFn: async (value: NewAccountPayload) => {
      await newAccount(value)
    },
  })

  const form = useAppForm({
    defaultValues: {
      platform: '"IBKR"' as Platform,
      file: null as File | null,
    },
    validators: {
      onChange: z.object({
        platform: z.enum(['"IBKR"']),
        file: z.file(),
      }),
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        await newAccountMutation.mutateAsync({
          platform: value.platform!,
          file: value.file!,
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
          <CardAction>
            <Dialog open={dialogVisible} onOpenChange={setDialogVisible}>
              <DialogTrigger asChild>
                <Button>New account</Button>
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
                    <DialogTitle>New Account</DialogTitle>
                    <DialogDescription>
                      Select platform and file to create new account.
                    </DialogDescription>
                  </DialogHeader>
                  <form.AppField
                    name="platform"
                    children={(field) => (
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="platform" className="px-1">
                          Platform
                        </Label>
                        <Select
                          onValueChange={(e) =>
                            field.handleChange(e as Platform)
                          }
                          value={field.state.value}
                        >
                          <SelectTrigger id="platform" className="w-full">
                            <SelectValue placeholder="Platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={`"IBKR"`}>IBKR</SelectItem>
                          </SelectContent>
                        </Select>
                        <field.ErrorInfo />
                      </div>
                    )}
                  />
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
                      params: { account_id: row.original.id },
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
