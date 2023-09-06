import { type } from 'os'
import myAxios from './http'

type MakerListParams = {
  chain: string
  page: number
  size: number
  contract: string
  search?: string
  owner?: string
}

type MakerDealParams = {
  chain: string
  dealId: number
  contract: string
}
type UserFeeParams = {
  chain: string
  user: string
  contract: string
}

type MakerListData = {
  list: []
  total: number
}

export function makerList(paramsList: MakerListParams) {
  return myAxios({
    url: '/v1/deal/maker/list',
    method: 'post',
    data: paramsList,
  })
}

//查单个交易
export function makerDeal(params: MakerDealParams) {
  return myAxios({
    url: '/v1/deal/maker/deal',
    method: 'post',
    data: params,
  })
}

type TakerListParams = {
  chain: string
  page: number
  size: number
  contract: string
  search?: string
  owner?: string
  dewithMakeralId?: number
  withMaker?: boolean
}

//查发起的swap
export function takerList(params: TakerListParams) {
  return myAxios({
    url: '/v1/deal/taker/list',
    method: 'post',
    data: params,
  })
}

//查询metaswap信息
export function metaswapInfo(params: { chain: string }) {
  return myAxios({
    url: '/v1/deal/metaswap/info',
    method: 'post',
    data: params,
  })
}

//查成交的手续费
export function userfee(params: UserFeeParams) {
  return myAxios({
    url: '/v1/deal/metaswap/userfee',
    method: 'post',
    data: params,
  })
}
