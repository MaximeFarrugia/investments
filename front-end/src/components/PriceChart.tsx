import { useEffect, useRef } from 'react'
import { CandlestickSeries, createChart, CrosshairMode } from 'lightweight-charts'
import styled from 'styled-components'

interface Props {
  className?: string
  data: Array<{
    time: string
    open: number
    high: number
    low: number
    close: number
  }>
}

const PriceChart = (props: Props) => {
  const { className, data } = props

  const chartContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) {
      return
    }

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current!.clientWidth,
      })
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      rightPriceScale: {
        autoScale: false,
      },
      crosshair: {
        mode: CrosshairMode.MagnetOHLC,
      }
    })
    chart.timeScale().fitContent()

    const newSeries = chart.addSeries(CandlestickSeries)
    newSeries.setData(data)

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      chart.remove()
    }
  }, [data])

  return <Container ref={chartContainerRef} className={className} />
}

export default PriceChart

const Container = styled.div`
  width: 100%;
  height: 100%;
`
