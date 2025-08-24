import { createFileRoute } from '@tanstack/react-router'
import OpenPositions from './-open_positions'
import Dividends from './-dividends'

function RouteComponent() {
  return (
    <div className="p-4 flex gap-2 flex-wrap">
      <OpenPositions />
      <Dividends />
    </div>
  )
}

export const Route = createFileRoute('/_auth/account/$account_id/')({
  component: RouteComponent,
})
