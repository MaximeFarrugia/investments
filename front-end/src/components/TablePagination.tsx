import type { Pagination, PaginationData } from '@/api'

import {
  PaginationButton,
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationItem,
  PaginationNextButton,
  PaginationPreviousButton,
} from './ui/pagination'
import { useMemo } from 'react'

interface Props {
  pagination: PaginationData
  onChange: (newPagination: Pagination) => unknown
}

const TablePagination = ({ pagination, onChange }: Props) => {
  const offsets = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(pagination.total_count / pagination.limit) },
        (_, i) => i * pagination.limit,
      ),
    [pagination],
  )

  if (!pagination.has_prev && !pagination.has_next) {
    return null
  }

  return (
    <PaginationComponent>
      <PaginationContent>
        {pagination.has_prev && (
          <PaginationItem>
            <PaginationPreviousButton
              onClick={() =>
                onChange({
                  offset: pagination.offset - pagination.limit,
                  limit: pagination.limit,
                })
              }
            />
          </PaginationItem>
        )}
        {offsets.map((offset, i) => (
          <PaginationButton
            key={offset}
            variant={pagination.offset === offset ? 'default' : 'secondary'}
            onClick={() =>
              onChange({
                offset,
                limit: pagination.limit,
              })
            }
          >
            {i + 1}
          </PaginationButton>
        ))}
        {pagination.has_next && (
          <PaginationItem>
            <PaginationNextButton
              onClick={() =>
                onChange({
                  offset: pagination.offset + pagination.limit,
                  limit: pagination.limit,
                })
              }
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </PaginationComponent>
  )
}

export default TablePagination
