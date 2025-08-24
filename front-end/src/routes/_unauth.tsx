import { userDetails } from '@/api/user'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_unauth')({
  beforeLoad: async () => {
    let isAuth = false
    try {
      await userDetails()
      isAuth = true
    } catch (err) {
      console.error(err)
    }
    if (isAuth) {
      throw redirect({ to: '/', search: { offset: 0, limit: 20 } })
    }
  },
})
