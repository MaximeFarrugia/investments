import { useEffect, useRef, useState } from 'react'
import {
  LineSeries,
  createChart,
  CrosshairMode,
  type Time,
  type MouseEventParams,
  type Point,
} from 'lightweight-charts'
import styled from 'styled-components'

interface Props {
  className?: string
  series: Array<{
    name: string
    data: Array<{
      time: string
      value: number
      color?: string
    }>
  }>
}

const LineChart = (props: Props) => {
  const { className, series } = props
  const [tooltipData, setTooltipData] = useState<Props['series']>([])

  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

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
      },
    })
    chart.timeScale().fitContent()

    series.forEach((e) => {
      const newSeries = chart.addSeries(LineSeries, {
        title: e.name,
        lineWidth: 2,
      })
      newSeries.setData(e.data)
    })

    const handleCrosshairMove = (param: MouseEventParams<Time>) => {
      if (!tooltipRef.current || !chartContainerRef.current) {
        return
      }

      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current.clientHeight
      ) {
        tooltipRef.current.style.display = 'none'
      } else {
        tooltipRef.current.style.display = 'block'
        const data = series
          .map((e) => ({
            ...e,
            data: e.data.filter((x) => x.time === param.time),
          }))
          .filter((e) => e.data.length)
        setTooltipData(data)

        const calculateXPosition = (point: Point, tooltipWidth: number) => {
          const x = point.x + chart.priceScale('left').width()
          const deadzoneWidth = Math.ceil(tooltipWidth / 2)
          const xAdjusted = Math.min(
            Math.max(deadzoneWidth, x),
            chart.timeScale().width() - deadzoneWidth,
          )
          return `calc(${xAdjusted}px - 50%)`
        }

        const calculateYPosition = (point: Point, tooltipHeight: number) => {
          const y = point.y
          const verticalSpacing = 10
          const flip = y <= tooltipHeight + verticalSpacing
          const yPx = y + (flip ? 1 : -1) * verticalSpacing
          const yPct = flip ? '' : ' - 100%'
          return `calc(${yPx}px${yPct})`
        }

        tooltipRef.current.style.transform = `translate(${calculateXPosition(
          param.point,
          tooltipRef.current.clientWidth,
        )}, ${calculateYPosition(
          param.point,
          tooltipRef.current.clientHeight,
        )})`
      }
    }

    chart.subscribeCrosshairMove(handleCrosshairMove)

    window.addEventListener('resize', handleResize)

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove)
      window.removeEventListener('resize', handleResize)

      chart.remove()
    }
  }, [series])

  return (
    <Container ref={chartContainerRef} className={className}>
      <Tooltip ref={tooltipRef}>
        {tooltipData.map((e) => (
          <p key={`tooltip-${e.name}`} style={{ color: e.data[0].color }}>
            <strong>{e.name}:</strong> {e.data[0].value}
          </p>
        ))}
      </Tooltip>
    </Container>
  )
}

export default LineChart

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const Tooltip = styled.div`
  display: none;
  position: absolute;
  background-color: white;
  z-index: 1000;
  pointer-events: none;
  padding: 5px 10px;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;
`
