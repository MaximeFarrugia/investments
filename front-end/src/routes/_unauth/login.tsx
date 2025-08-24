import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { createFormHook } from '@tanstack/react-form'
import { z } from 'zod'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { fieldContext, formContext } from '@/hooks/form_context'
import TextField from '@/components/form/TextField'
import PasswordField from '@/components/form/PasswordField'
import ErrorInfo from '@/components/form/ErrorInfo'
import SubmitButton from '@/components/form/SubmitButton'
import { login } from '@/api/user'
import axios, { AxiosError } from 'axios'
import type { AppError } from '@/api'
import { toast } from 'sonner'

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    PasswordField,
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
  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: z.object({
        email: z.email(),
        password: z.string().min(1),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        await login(value)
        navigate({ to: '/', search: { offset: 0, limit: 20 } })
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const errorText = (err as AxiosError<AppError>).response?.data.detail
          if (!errorText) {
            console.log(err)
          }
          toast(errorText)
        } else {
          console.error(err)
        }
      }
    },
  })

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-6">
      <form
        className="w-full max-w-sm"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <form.AppField
                name="email"
                children={(field) => (
                  <div>
                    <field.TextField
                      label="Email"
                      placeholder="john.doe@email.com"
                    />
                    <field.ErrorInfo />
                  </div>
                )}
              />
              <form.AppField
                name="password"
                children={(field) => (
                  <div>
                    <field.PasswordField
                      label="Password"
                      placeholder="**********"
                    />
                    <field.ErrorInfo />
                  </div>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <form.AppForm>
              <form.SubmitButton className="w-full" label="Log in" />
            </form.AppForm>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export const Route = createFileRoute('/_unauth/login')({
  component: RouteComponent,
})
