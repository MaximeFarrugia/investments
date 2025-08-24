import { useFieldContext } from '@/hooks/form_context'

const ErrorInfo = () => {
  const field = useFieldContext()

  return field.state.meta.isValid ? null : (
    <em className="whitespace-pre text-xs text-red-500">
      {field.state.meta.errors
        .map((e) => e?.message)
        .filter(Boolean)
        .join('\n')}
    </em>
  )
}

export default ErrorInfo
