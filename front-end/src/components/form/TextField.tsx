import { useFieldContext } from '@/hooks/form_context'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

interface Props
  extends Omit<React.ComponentProps<'input'>, 'id' | 'value' | 'onChange'> {
  label: string
}

const TextField = ({ label, ...props }: Props) => {
  const field = useFieldContext<string>()

  return (
    <div className="grid gap-2">
      <Label htmlFor={field.name} className="px-1">
        {label}
      </Label>
      <Input
        {...props}
        id={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </div>
  )
}

export default TextField
