import ErrorInfo from '@/components/form/ErrorInfo'
import SubmitButton from '@/components/form/SubmitButton'
import TextField from '@/components/form/TextField'
import { CardTitle } from '@/components/ui/card'
import { fieldContext, formContext } from '@/hooks/form_context'
import { createFormHook } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import z from 'zod'
import AnalysisCharts from './-analysis_charts'

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    ErrorInfo,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { symbol } = Route.useSearch()

  const form = useAppForm({
    defaultValues: {
      symbol: symbol ?? '',
    },
    validators: {
      onChange: z.object({
        symbol: z.string().nonempty(),
      }),
    },
    onSubmit: ({ value }) => {
      navigate({
        to: Route.fullPath,
        search: {
          symbol: value.symbol,
        },
        replace: true,
      })
    },
  })

  return (
    <div className="p-4 flex flex-col gap-4">
      <CardTitle>Stock Analysis</CardTitle>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.AppField
          name="symbol"
          children={(field) => (
            <div>
              <div className="flex items-end gap-2">
                <field.TextField
                  label="Symbol"
                  placeholder="AAPL"
                  className="w-[100px]"
                />
                <form.AppForm>
                  <form.SubmitButton label="Go" />
                </form.AppForm>
              </div>
              <field.ErrorInfo />
            </div>
          )}
        />
      </form>
      {!!symbol && <AnalysisCharts symbol={symbol} />}
    </div>
  )
}

export const Route = createFileRoute('/_auth/analysis/stock/')({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        symbol: z.string().optional(),
      })
      .parse(search),
})
