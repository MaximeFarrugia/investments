import { useFieldContext } from '@/hooks/form_context'
import { Label } from '../ui/label'
import Password from '../ui/password'

interface Props {
  label: string
  placeholder?: string
}

const TextField = ({ label, placeholder }: Props) => {
  const field = useFieldContext<string>()

  return (
    <div className="grid gap-2">
      <Label htmlFor={field.name} className="px-1">{label}</Label>
      <Password
        id={field.name}
        placeholder={placeholder}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </div>
  )
}

export default TextField
