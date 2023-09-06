import myAxios from './http'
type TokenFindParams = {
  chain: string
  addressOrSymbol: string
}

type TokenBalanceParams = {
  chain: string
  tokenAddress: string
  ownerAddress: string
  tokenId?: number
}

type TokenAllowanceParams = {
  chain: string
  tokenAddress: string //合约
  ownerAddress: string //拥有者
  operatorAddress: string //操作者
  tokenStd: string //标准 1 721 0 erc20
  tokenIds?: number[]
  tokenBalances?: Number[]
}

type TokenInfoParams = {
  chain: string
  tokenAddress: string //合约
  tokenId?: number //
}

type TokenCheckParams = {
  chain: string
  tokenAddress: string //合约
  ownerAddress: string //拥有者
  tokenId?: number //token id(erc721|erc1155)
  tokenBalances?: number
}
export function tokenFind(params: TokenFindParams) {
  return myAxios({
    url: '/v1/contract/token/find',
    method: 'post',
    data: params,
  })
}

export function tokenBalance(params: TokenBalanceParams) {
  return myAxios({
    url: '/v1/contract/token/balance',
    method: 'post',
    data: params,
  })
}

//查询资产是否已经授权

export function tokenAllowance(params: TokenAllowanceParams) {
  return myAxios({
    url: '/v1/contract/token/allowance',
    method: 'post',
    data: params,
  })
}

//查询资产是否有效
export function tokenCheck(params: TokenCheckParams) {
  return myAxios({
    url: '/v1/contract/token/check',
    method: 'post',
    data: params,
  })
}

//查资产详情
export function tokenInfo(params: TokenInfoParams) {
  return myAxios({
    url: '/v1/contract/token/info',
    method: 'post',
    data: params,
  })
}
