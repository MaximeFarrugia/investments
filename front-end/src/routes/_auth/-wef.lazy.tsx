import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'

import PriceChart from '@/components/PriceChart'
import LineChart from '@/components/LineChart'

interface HistoricalPriceApiResponse {
  results: Array<{
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
    dividend: number
  }>
}

function RouteComponent() {
  const { isPending, error, data } = useQuery({
    queryKey: ['historical_price'],
    queryFn: async () => {
      const response = await fetch(
        'http://localhost:6900/api/v1/equity/price/historical?provider=yfinance&symbol=AAPL&start_date=1970-01-01',
      )
      return (await response.json()) as HistoricalPriceApiResponse
    },
  })

  if (isPending) return <p>Loading...</p>

  if (error) return <p>Error: {error.message}</p>

  return (
    <Wrapper>
      <Card>
        <PriceChart
          data={data.results.map((e) => ({
            time: e.date,
            open: e.open,
            high: e.high,
            low: e.low,
            close: e.close,
          }))}
        />
      </Card>
      <Card>
        <LineChart
          series={[
            {
              name: 'Volume',
              data: data.results.map((e) => ({
                time: e.date,
                value: e.volume,
              })),
            },
            {
              name: 'Dividend',
              data: data.results.map((e) => ({
                time: e.date,
                value: e.volume * Math.random(),
                color: 'red',
              })),
            },
          ]}
        />
      </Card>
      <Card>
        <LineChart
          series={[
            {
              name: 'Volume',
              data: data.results.map((e) => ({
                time: e.date,
                value: e.volume,
              })),
            },
            {
              name: 'Dividend',
              data: data.results.map((e) => ({
                time: e.date,
                value: e.volume * Math.random(),
                color: 'red',
              })),
            },
          ]}
        />
      </Card>
      <Card>
        <LineChart
          series={[
            {
              name: 'Volume',
              data: data.results.map((e) => ({
                time: e.date,
                value: e.volume,
              })),
            },
            {
              name: 'Dividend',
              data: data.results.map((e) => ({
                time: e.date,
                value: e.volume * Math.random(),
                color: 'red',
              })),
            },
          ]}
        />
      </Card>
      <Card>
        <LineChart
          series={[
            {
              name: 'Volume',
              data: data.results.map((e) => ({
                time: e.date,
                value: e.volume,
              })),
            },
            {
              name: 'Dividend',
              data: data.results.map((e) => ({
                time: e.date,
                value: e.volume * Math.random(),
                color: 'red',
              })),
            },
          ]}
        />
      </Card>
      <Card>
        <LineChart
          series={[
            {
              name: 'Volume',
              data: data.results.map((e) => ({
                time: e.date,
                value: e.volume,
              })),
            },
            {
              name: 'Dividend',
              data: data.results.map((e) => ({
                time: e.date,
                value: e.volume * Math.random(),
                color: 'red',
              })),
            },
          ]}
        />
      </Card>
      <Card>
        <LineChart
          series={[
            {
              name: 'Volume',
              data: data.results.map((e) => ({
                time: e.date,
                value: e.volume,
              })),
            },
            {
              name: 'Dividend',
              data: data.results.map((e) => ({
                time: e.date,
                value: e.volume * Math.random(),
                color: 'red',
              })),
            },
          ]}
        />
      </Card>
    </Wrapper>
  )
}

export default RouteComponent

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: auto;
  padding: 20px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
`

const Card = styled.div`
  padding: 10px;
  border: 1px solid #ececec;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px;
  flex: 1 0 calc((100vw - 40px) / 3 - 20px);
  height: calc((100vh - 40px) / 2 - 10px);
`
