import ApiError from '@/components/ApiError'
import { useStockAnalysis } from '@/components/StockAnalysis/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { Suspense, type PropsWithChildren } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

interface Props {
  title: string
}

const FallbackCard = ({ title, children }: PropsWithChildren<Props>) => {
  const { symbol, annual } = useStockAnalysis()

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-[50%]" />
                  <Skeleton className="h-4 w-[20%]" />
                  <Skeleton className="h-4 w-[30%]" />
                </div>
              </CardContent>
            </Card>
          }
        >
          <ErrorBoundary
            onReset={reset}
            resetKeys={[symbol, annual]}
            fallbackRender={({ error }) => (
              // fallback={(error) => (
              <Card>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ApiError error={error} />
                </CardContent>
              </Card>
            )}
          >
            {children}
          </ErrorBoundary>
        </Suspense>
      )}
    </QueryErrorResetBoundary>
  )
}

export default FallbackCard
