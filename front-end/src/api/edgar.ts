import axios from 'axios'

export interface CompanyInfo {
  name: string
  ticker: string
  shares_outstanding: number
  public_float: number
}

export interface Data<T extends string> {
  label: string
  concept: string
  values: {
    [k in T]: DataValue
  }
  is_total: boolean
  depth: number
}

export interface DataValue {
  raw_value: number
  display_value: string
}

export type IncomeStatementDataKeys =
  | 'RevenueFromContractWithCustomerExcludingAssessedTax'
  | 'OperatingIncomeLoss'
  | 'NetIncomeLoss'
  | 'EarningsPerShareBasic'
  | 'EarningsPerShareDiluted'
  | 'IncomeTaxExpenseBenefit'
  | 'IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest'
  | 'GrossProfit'
  | 'OperatingExpenses'

export type BalanceSheetDataKeys =
  | 'Assets'
  | 'AssetsCurrent'
  | 'CashAndCashEquivalentsAtCarryingValue'
  | 'AccountsReceivableNetCurrent'
  | 'PropertyPlantAndEquipmentNet'
  | 'OtherAssetsNoncurrent'
  | 'LiabilitiesAndStockholdersEquity'
  | 'Liabilities'
  | 'LiabilitiesCurrent'
  | 'LiabilitiesNoncurrent'
  | 'OtherLiabilitiesNoncurrent'
  | 'RetainedEarningsAccumulatedDeficit'
  | 'StockholdersEquity'
  | 'AccumulatedOtherComprehensiveIncomeLossNetOfTax'

export type CashFlowDataKeys =
  | 'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents'
  | 'NetCashProvidedByUsedInFinancingActivitiesAbstract'
  | 'NetCashProvidedByUsedInFinancingActivities'
  | 'PaymentsForRepurchaseOfCommonStock'
  | 'NetCashProvidedByUsedInInvestingActivitiesAbstract'
  | 'NetCashProvidedByUsedInInvestingActivities'
  | 'PaymentsToAcquirePropertyPlantAndEquipment'
  | 'PaymentsToAcquireBusinessesNetOfCashAcquired'
  | 'NetCashProvidedByUsedInOperatingActivitiesAbstract'
  | 'NetCashProvidedByUsedInOperatingActivities'
  | 'AdjustmentsToReconcileNetIncomeLossToCashProvidedByUsedInOperatingActivitiesAbstract'
  | 'ShareBasedCompensation'
  | 'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalentsPeriodIncreaseDecreaseIncludingExchangeRateEffect'
  | 'CapitalExpenditures'

export interface EdgarApiResponse<T extends string> {
  company_info: CompanyInfo
  periods: string[]
  data: Data<T>
}

export interface Query {
  periods: number
  annual: boolean
}

export const getIncomeStatement = (symbol: string, query?: Query) => {
  return axios.get<EdgarApiResponse<IncomeStatementDataKeys>>(
    `/edgar/financial/${symbol}/income`,
    {
      params: {
        periods: query?.periods ?? 5,
        annual: query?.annual ?? true,
      },
    },
  )
}

export const getBalanceSheet = (symbol: string, query?: Query) => {
  return axios.get<EdgarApiResponse<BalanceSheetDataKeys>>(
    `/edgar/financial/${symbol}/balance`,
    {
      params: {
        periods: query?.periods ?? 5,
        annual: query?.annual ?? true,
      },
    },
  )
}

export const getCashFlow = (symbol: string, query?: Query) => {
  return axios.get<EdgarApiResponse<CashFlowDataKeys>>(
    `/edgar/financial/${symbol}/cashflow`,
    {
      params: {
        periods: query?.periods ?? 5,
        annual: query?.annual ?? true,
      },
    },
  )
}
