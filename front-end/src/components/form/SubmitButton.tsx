import { useFormContext } from '@/hooks/form_context'
import { Button } from '../ui/button'

interface Props extends Omit<React.ComponentProps<'button'>, 'type'> {
  label: string
}

const SubmitButton = ({ label, disabled, ...props }: Props) => {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button {...props} type="submit" disabled={disabled || isSubmitting}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}

export default SubmitButton
