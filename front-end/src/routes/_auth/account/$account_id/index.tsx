import { createFileRoute } from '@tanstack/react-router'
import OpenPositions from './-open_positions'
import Dividends from './-dividends'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Statements from './-statements'

function RouteComponent() {
  return (
    <div className="p-4">
      <Tabs defaultValue="dividends">
        <TabsList>
          <TabsTrigger value="dividends">Dividends</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
        </TabsList>
        <TabsContent value="dividends">
          <Dividends />
        </TabsContent>
        <TabsContent value="analysis">
          <OpenPositions />
        </TabsContent>
        <TabsContent value="statements">
          <Statements />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const Route = createFileRoute('/_auth/account/$account_id/')({
  component: RouteComponent,
})
