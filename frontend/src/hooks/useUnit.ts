import { utils } from 'ethers'

export function useUnit() {
  const weiToEth = (value) => {
    return utils.formatEther(value)
  }

  const ethToWei = (value) => {
    return utils.parseEther(value)
  }

  return { weiToEth, ethToWei }
}
