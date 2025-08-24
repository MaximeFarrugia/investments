import type { AppError } from '@/api'
import { userDetails } from '@/api/user'
import Header from '@/components/Header'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import axios, { AxiosError } from 'axios'

function RouteComponent() {
  return (
    <div className="bg-background relative z-10000 flex flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  beforeLoad: async () => {
    try {
      await userDetails()
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        (err as AxiosError<AppError>).response?.data.status === 401
      ) {
        throw redirect({ to: '/login' })
      } else {
        console.error(err)
      }
    }
  },
})
