import axios from 'axios'
import { type PaginationData, type Pagination, type ObjectId } from '.'

export interface ListAccountsResponse {
  accounts: Account[]
  pagination: PaginationData
}

export type Platform = 'IBKR'

export interface Account {
  _id: ObjectId
  user_id: ObjectId
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

export interface OpenPositionsResponse {
  open_positions: OpenPosition[]
  pagination: PaginationData
}

export interface OpenPosition {
  _id: ObjectId
  account_id: ObjectId
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

export interface DividendsResponse {
  dividends: Dividend[]
  pagination: PaginationData
}

export interface Dividend {
  _id: ObjectId
  account_id: ObjectId
  symbol: string
  date: string
  amount: string
  currency: string
}

export const getDividends = (account_id: string, pagination: Pagination) => {
  return axios.get<DividendsResponse>(
    `/api/portfolio/accounts/${account_id}/dividends`,
    {
      params: pagination,
    },
  )
}
