import axios from 'axios'
import { type PaginationData, type Pagination } from '.'

export interface ListAccountsResponse {
  accounts: Account[]
  pagination: PaginationData
}

export type Platform = '"IBKR"'

export interface Account {
  id: string
  user_id: string
  name: string
  platform: Platform
  base_currency: string
  created_at: string
  updated_at: string
}

export const listAccounts = (pagination: Pagination) => {
  return axios.get<ListAccountsResponse>('/api/portfolio/accounts', {
    params: pagination,
  })
}

export interface NewAccountPayload {
  platform: Platform
  file: File
}

export interface NewAccountResponse {
  account_id: string
}

export const newAccount = (account: NewAccountPayload) => {
  const formData = new FormData()
  formData.append('platform', account.platform)
  formData.append('file', account.file)
  return axios.post<NewAccountResponse>('/api/portfolio/accounts', formData, {
    headers: {
      'content-type': 'multipart/form-data',
    },
  })
}

export interface OpenPositionsResponse {
  open_positions: OpenPosition[]
  pagination: PaginationData
}

export interface OpenPosition {
  id: string
  account_id: string
  symbol: string
  quantity: string
  cost_price: string
  currency: string
}

export const getOpenPositions = (
  account_id: string,
  pagination: Pagination,
) => {
  return axios.get<OpenPositionsResponse>(
    `/api/portfolio/accounts/${account_id}/open_positions`,
    {
      params: pagination,
    },
  )
}

export interface DividendsQuery {
  start_date: Date
  end_date: Date
}

export interface DividendsResponse {
  dividends: Dividend[]
  pagination: PaginationData
}

export interface Dividend {
  id: string
  account_id: string
  symbol: string
  date: string
  amount: string
  currency: string
}

export const getDividends = (account_id: string, query: DividendsQuery) => {
  return axios.get<DividendsResponse>(
    `/api/portfolio/accounts/${account_id}/dividends`,
    {
      params: query,
    },
  )
}
