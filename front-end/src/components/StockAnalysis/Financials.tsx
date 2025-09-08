import { useSuspenseQuery } from '@tanstack/react-query'
import { useStockAnalysis } from './context'
import { useMemo } from 'react'
import { getFinancials, type Facts } from '@/api/financial'

type ChartData = {
  fpy: string
} & Record<string, number>

interface Props {
  className?: string
  concepts: Record<
    string,
    Array<{ concept: string; label: string; color: string }>
  >
  content: (data: ChartData[]) => React.ReactNode
}

const Financials = ({ content, concepts }: Props) => {
  const { symbol, annual } = useStockAnalysis()
  const { data } = useSuspenseQuery({
    queryKey: ['financials', symbol, annual],
    queryFn: () => getFinancials(symbol, annual),
    staleTime: 30 * 1000,
  })

  const chartData = useMemo(() => {
    const periodMap: Record<string, ChartData> = {}

    for (const [, conceptList] of Object.entries(concepts)) {
      for (const { concept, label } of conceptList) {
        const [namespace, conceptName] = concept.split(':')

        const conceptData =
          data?.data?.facts?.[namespace as keyof Facts]?.[conceptName]
        if (!conceptData) continue

        for (const values of Object.values(conceptData.units)) {
          for (const v of values) {
            if (!v.fy || !v.fp) continue

            const fpy = `${v.fp} ${v.fy}`

            if (!periodMap[fpy]) {
              periodMap[fpy] = { fpy } as ChartData
            }

            periodMap[fpy][label] = parseFloat(v.val)
          }
        }
      }
    }

    return Object.values(periodMap).sort((a, b) => {
      const [fpA, fyA] = a.fpy.split(' ')
      const [fpB, fyB] = b.fpy.split(' ')

      const yearDiff = Number(fyA) - Number(fyB)
      if (yearDiff !== 0) return yearDiff

      const order = ['Q1', 'Q2', 'Q3', 'Q4', 'FY']
      return order.indexOf(fpA) - order.indexOf(fpB)
    })
  }, [data, concepts])

  return content(chartData)
}

export default Financials
