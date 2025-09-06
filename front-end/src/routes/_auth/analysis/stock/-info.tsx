import StockAnalysis from '@/components/StockAnalysis'
import FallbackCard from './-fallback_card'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useStockAnalysis } from '@/components/StockAnalysis/context'
import { Badge } from '@/components/ui/badge'

interface Props {
  className?: string
}

const Info = ({ className }: Props) => {
  const { symbol } = useStockAnalysis()

  return (
    <FallbackCard className={className} title={`Info (${symbol})`}>
      <StockAnalysis.Info
        content={(data) => (
          <Card className={className}>
            <CardHeader>
              <CardTitle>{`Info (${symbol})`}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <CardDescription>Names by data provider:</CardDescription>
                <div className="flex flex-wrap gap-2">
                  <Badge>{`Yahoo Finance: ${data.yfinance[0]?.name ?? 'N/A'}`}</Badge>
                  <Badge>{`SEC: ${data?.sec?.name ?? 'N/A'}`}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      />
    </FallbackCard>
  )
}

export default Info
