import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons'
import { useMemo, useState } from 'react'
import { Input } from './input'

const Password = (props: Omit<React.ComponentProps<'input'>, 'type'>) => {
  const [visible, setVisible] = useState(false)
  const Icon = useMemo(() => (visible ? EyeOpenIcon : EyeNoneIcon), [visible])

  return (
    <div className="flex items-center gap-2">
      <Input {...props} type={visible ? 'text' : 'password'} />
      <Icon onClick={() => setVisible((v) => !v)} />
    </div>
  )
}

export default Password
