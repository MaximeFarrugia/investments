import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { userDetails } from '@/api/user'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Skeleton } from './ui/skeleton'

const Header = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ['user_details'],
    queryFn: userDetails,
  })
  const username = useMemo(
    () => data?.data.user.email.split('@')[0] ?? 'User',
    [data],
  )

  if (error) return <p>Error: {error.message}</p>

  return (
    <header className="bg-background sticky top-0 w-full flex items-center justify-between p-4 z-1000">
      <div>
        <Link to="/" search={{ offset: 0, limit: 20 }}>
          Dashboard
        </Link>
      </div>
      <div>
        <DropdownMenu>
          {isPending ? (
            <Skeleton className="h-4 w-[200px]" />
          ) : (
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{username}</Button>
            </DropdownMenuTrigger>
          )}
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => console.log('log out')}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Header
