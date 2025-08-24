export interface AppError {
  status: number
  title: string
  detail: string
}

export interface Pagination {
  offset: number
  limit: number
}

export interface PaginationData {
  total_count: number
  offset: number
  limit: number
  has_next: boolean
  has_prev: boolean
}
