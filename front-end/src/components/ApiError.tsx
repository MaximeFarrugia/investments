import type { AppError } from '@/api'
import { useNavigate } from '@tanstack/react-router'
import axios, { AxiosError } from 'axios'
import { useEffect, useMemo } from 'react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertCircleIcon } from 'lucide-react'

interface Props {
  error: Error
}

const ApiError = ({ error }: Props) => {
  const navigate = useNavigate()
  const errorMessage = useMemo(() => {
    if (axios.isAxiosError(error)) {
      return (
        (error as AxiosError<AppError>).response?.data.title ??
        (error as AxiosError<string>).response?.data ??
        (error as AxiosError).message
      )
    } else {
      return error.message
    }
  }, [error])

  useEffect(() => {
    if (axios.isAxiosError(error) && (error as AxiosError).status === 401) {
      navigate({ to: '/login' })
    }
  }, [error, navigate])
  console.log(error)

  return axios.isAxiosError(error) ? (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{errorMessage}</AlertTitle>
      <AlertDescription>
        {(error as AxiosError<AppError>).response?.data.detail}
      </AlertDescription>
    </Alert>
  ) : (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{error.message}</AlertTitle>
    </Alert>
  )
}

export default ApiError
