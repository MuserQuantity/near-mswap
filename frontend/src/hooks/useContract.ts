import { metaswapV1ContractConfig } from '@/abi/metaswap'
import { useContractRead, useContractWrite } from 'wagmi'
type TokenData = {
  tokenStd: number
  tokenAddress: `0x${string}`
  tokenIds: bigint[]
  tokenBalances: bigint[]
}

export const swapIds = () =>
  useContractRead({
    ...metaswapV1ContractConfig,
    functionName: 'swapIds',
  })

export const createSwapDeal = (tokenData, days, value = BigInt(0)) => {
  // const erc20: TokenData = {
  //   tokenStd: 0,
  //   tokenAddress: '0x0000000000000000000000000000000000000020' as `0x${string}`,
  //   tokenIds: [BigInt(1)],
  //   tokenBalances: [BigInt(1)],
  // }
  //  const { write, data, error, isLoading, isError, isSuccess } =
  return useContractWrite({
    ...metaswapV1ContractConfig,
    functionName: 'createSwapDeal',
    args: [tokenData, days],
    value: value,
  })
}

// export function useContract() {
//   const swapIds = () => {
//     // const contract = getContract({
//     //   address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
//     //   abi: metaswapAbi
//     // })
//     //   const { data, isRefetching, isSuccess, refetch }
//     return useContractRead({
//       ...metaswapV1ContractConfig,
//       functionName: 'swapIds',
//     })
//   }

//   const createSwapDeal = (tokenData, days, value = BigInt(0)) => {
//     // const erc20: TokenData = {
//     //   tokenStd: 0,
//     //   tokenAddress: '0x0000000000000000000000000000000000000020' as `0x${string}`,
//     //   tokenIds: [BigInt(1)],
//     //   tokenBalances: [BigInt(1)],
//     // }
//     //  const { write, data, error, isLoading, isError, isSuccess } =
//     return useContractWrite({
//       ...metaswapV1ContractConfig,
//       functionName: 'createSwapDeal',
//       args: [tokenData, days],
//       value: value,
//     })
//   }

//   return { createSwapDeal, swapIds }
// }
