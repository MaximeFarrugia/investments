import { useState } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { EnterFullScreenIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

interface Props {
  title: React.ReactNode
  description?: React.ReactNode
  cardClassName?: string
  dialogClassName?: string
  card: () => React.ReactNode
  dialog: () => React.ReactNode
}

const PopOutCard = ({
  title,
  description,
  cardClassName,
  dialogClassName,
  card,
  dialog,
}: Props) => {
  const [dialogVisible, setDialogVisible] = useState(false)

  return (
    <>
      <Card className={cardClassName}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {!!description && <CardDescription>{description}</CardDescription>}
          <CardAction>
            <EnterFullScreenIcon
              className="cursor-pointer"
              onClick={() => setDialogVisible(true)}
            />
          </CardAction>
        </CardHeader>
        <CardContent>{card()}</CardContent>
      </Card>
      <Dialog open={dialogVisible} onOpenChange={setDialogVisible}>
        <DialogContent
          className={cn(
            'lg:max-w-[80dvw] sm:max-w-[95dvw] max-w-[95dvw]',
            dialogClassName,
          )}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {!!description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {dialog()}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PopOutCard
