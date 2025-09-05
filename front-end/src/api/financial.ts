import axios from 'axios'

export interface CompanyFacts {
  cik: number
  entityName: string
  facts: Facts
}

export interface Facts {
  dei: Record<string, Concept>
  'us-gaap': Record<string, Concept>
}

export interface Concept {
  label: string | null
  description: string | null
  units: Record<string, UnitValue[]>
}

export interface UnitValue {
  start: string | null
  end: string
  val: string
  accn: string
  fy: number | null
  fp: string | null
  form: string
  filed: string
  frame: string | null
}

export interface FinancialsResponse {
  facts: Facts
}

export const getFinancials = (symbol: string, annual?: boolean) => {
  return axios.get<FinancialsResponse>('/api/financial', {
    params: {
      symbol,
      annual,
    },
  })
}
