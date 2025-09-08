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

    const evalConceptExpr = (
      expr: string,
    ): Array<{ fpy: string; val: number }> | undefined => {
      if (expr.startsWith('calc(') && expr.endsWith(')')) {
        return evalConceptExpr(expr.slice(5, -1)) ?? []
      }

      const match = expr.match(/^(\w+)\((.+)\)$/)
      if (match) {
        const [, op, argsStr] = match
        const values = argsStr.split(',').map((e) => evalConceptExpr(e.trim()))

        if (values.some((x) => x === undefined)) return undefined

        const fpySet = values
          .map((e) => new Set(e!.map((x) => x.fpy)))
          .reduce((acc, curr) => acc.intersection(curr))
        const filteredValues = values.map((e) =>
          e!.filter((x) => fpySet.has(x.fpy)),
        )
        const dataByFpy: Record<
          string,
          Array<{ fpy: string; val: number }>
        > = fpySet.keys().reduce(
          (acc, curr) => ({
            ...acc,
            [curr]: filteredValues.flatMap((e) =>
              e.filter((x) => x.fpy === curr),
            ),
          }),
          {},
        )

        switch (op) {
          case 'add':
            return Object.entries(dataByFpy).reduce(
              (acc, [fpy, values]) => [
                ...acc,
                { fpy, val: values.reduce((acc1, x) => acc1 + x.val, 0) },
              ],
              [] as Array<{ fpy: string; val: number }>,
            )
          case 'sub':
            return Object.entries(dataByFpy).reduce(
              (acc, [fpy, values]) => [
                ...acc,
                {
                  fpy,
                  val: values.reduce(
                    (acc1, x, idx) => (idx > 0 ? acc1 - x.val : x.val),
                    0,
                  ),
                },
              ],
              [] as Array<{ fpy: string; val: number }>,
            )
          case 'mul':
            return Object.entries(dataByFpy).reduce(
              (acc, [fpy, values]) => [
                ...acc,
                { fpy, val: values.reduce((acc1, x) => acc1 * x.val, 1) },
              ],
              [] as Array<{ fpy: string; val: number }>,
            )
          case 'div':
            return Object.entries(dataByFpy).reduce(
              (acc, [fpy, values]) => [
                ...acc,
                {
                  fpy,
                  val: values.reduce(
                    (acc1, x, idx) => (idx > 0 ? acc1 / x.val : x.val),
                    0,
                  ),
                },
              ],
              [] as Array<{ fpy: string; val: number }>,
            )
          default:
            throw new Error(`Unknown op: ${op}`)
        }
      }

      if (!expr.includes(':')) return undefined

      const [namespace, conceptName] = expr.split(':')

      const conceptData =
        data?.data?.facts?.[namespace as keyof Facts]?.[conceptName]
      if (!conceptData) return undefined

      return Object.values(
        Object.values(conceptData.units)
          .flat()
          .filter((e) => e.fp && e.fy)
          .map((e) => ({
            fpy: `${e.fp} ${e.fy}`,
            val: parseFloat(e.val),
          }))
          .sort((a, b) => {
            const [fpA, fyA] = a.fpy.split(' ')
            const [fpB, fyB] = b.fpy.split(' ')

            const yearDiff = Number(fyA) - Number(fyB)
            if (yearDiff !== 0) return yearDiff

            const order = ['Q1', 'Q2', 'Q3', 'Q4', 'FY']
            return order.indexOf(fpA) - order.indexOf(fpB)
          })
          .reduce((acc, curr) => ({ ...acc, [curr.fpy]: curr }), {}),
      )
    }

    for (const [, conceptList] of Object.entries(concepts)) {
      for (const { concept, label } of conceptList) {
        const values = evalConceptExpr(concept) ?? []

        for (const v of values) {
          if (!periodMap[v.fpy]) {
            periodMap[v.fpy] = { fpy: v.fpy } as ChartData
          }

          periodMap[v.fpy][label] = v.val
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
