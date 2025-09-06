import { useQuery } from '@tanstack/react-query'
import { getCompanyProfile, type CompanyProfileApiResponse } from '@/api/openbb'
import { useStockAnalysis } from './context'
import { getCompanyInfo, type CompanyInfoResponse } from '@/api/financial'

interface Props {
  content: (data: {
    yfinance: CompanyProfileApiResponse['results']
    sec?: CompanyInfoResponse
  }) => React.ReactNode
}

const Info = ({ content }: Props) => {
  const { symbol } = useStockAnalysis()

  const { data: yfinance } = useQuery({
    queryKey: ['company_profile', symbol],
    queryFn: () => getCompanyProfile(symbol),
    gcTime: 30 * 1000,
    staleTime: 30 * 1000,
  })
  const { data: sec } = useQuery({
    queryKey: ['company_info', symbol],
    queryFn: () => getCompanyInfo(symbol),
    gcTime: 30 * 1000,
    staleTime: 30 * 1000,
  })

  return content({ yfinance: yfinance?.data?.results ?? [], sec: sec?.data })
}

export default Info
