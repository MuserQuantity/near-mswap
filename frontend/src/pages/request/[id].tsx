import CardItem from '@/components/cardItem'
import IconAdd from '@/common/images/icon/icon-add.png'
import { Button, Skeleton, message } from 'antd'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { makerDeal } from '@/api/deal'
import { setNewData } from '@/store/modules/tokenSlice'
import AddressText from '@/components/addressText'
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { metaswapV1ContractConfig } from '@/abi/metaswap'
import { hideLoading, showLoading } from '@/utils'
import { useTranslation } from 'react-i18next'
import { BigNumber } from 'ethers'
const bscContract = process.env.NEXT_PUBLIC_BSC_SWAP_CONTRACT as string

export async function getServerSideProps(context) {
  const { id } = context.query

  return {
    props: {
      id,
    },
  }
}

function Request({ id }) {
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [makerOwner, setMakerOwner] = useState(null)
  const listCard = useAppSelector((state) => state.tokenAddData.tokenData)
  const [listTopCard, setListTopCard] = useState<any>([])
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { address, isConnected } = useAccount()

  const { write, data } = useContractWrite({
    ...metaswapV1ContractConfig,
    functionName: 'submitSwapDeal',
    value: BigInt(0),
    onError(error) {
      console.log('Error', error)
      hideLoading()
      message.error(t('toast-fail'))
    },
  })
  //交易监听
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess(data) {
      console.log('监听交易是否成功', data)
      hideLoading()
      message.success(t('toast-success'))
      router.back()
    },
    onError(err) {
      console.log('监听交易失败', err)
      hideLoading()
      message.error(t('toast-block-fail'))
    },
  })

  const loadData = useCallback(async () => {
    // 加载 API 数据,传入页码参数
    const parmas = {
      dealId: Number(id),
      chain: 'bsc',
      contract: bscContract,
    }

    try {
      const result = await makerDeal(parmas)
      setLoading(false)
      setListTopCard(result.data.maker.tokens)
      setMakerOwner(result.data.maker.owner)
    } catch (error) {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    console.log('---开始加载--loadData')
    loadData()
  }, [])
  const deleteToken = (tempObj) => {
    console.log('删除了对应的token', tempObj)
    //找到这个元素
    const tempArr = [...listCard]
    let index = 0
    if (tempObj.tokenStd == 1 || tempObj.tokenStd == 2) {
      index = listCard.findIndex(
        (tokenIndexObj) =>
          tokenIndexObj.tokenId == tempObj.tokenId &&
          tokenIndexObj.tokenAddress == tempObj.tokenAddress
      )
    } else {
      //原生币 erc20
      index = listCard.findIndex(
        (tokenIndexObj) => tokenIndexObj.tokenAddress == tempObj.tokenAddress
      )
    }
    tempArr.splice(index, 1)
    dispatch(setNewData(tempArr))
  }
  const cancelSwap = () => {
    router.back()
  }
  const requestSwap = () => {
    if (!isConnected) {
      message.error(t('toast-connect-tip'))
      return
    }
    //  const erc20 = {
    //    tokenStd: 0,
    //    tokenAddress: '0x0000000000000000000000000000000000000020',
    //    tokenIds: [],
    //    tokenBalances: [1],
    //  }
    const chainParams: any[] = []
    //获取不是原生币的token List erc721 erc1155
    const erc721Arr = listCard.filter((a) => a.tokenStd == 1)
    //得到721数组里相同的token
    const erc721Address = erc721Arr.map((item) => {
      return item.tokenAddress
    })
    const erc721SameArr = erc721Address.filter((elem, index, arr) => arr.indexOf(elem) !== index)
    console.log('---重复的token', erc721SameArr)
    //查找其他相同的元素，剔除相同的这些 地址的元素
    const erc721NoSameArr = erc721Arr.filter((a) => !erc721SameArr.includes(a.tokenAddress))
    console.log('---不重复的token', erc721NoSameArr)
    erc721NoSameArr.forEach((item, index) => {
      const params = {
        tokenStd: 1,
        tokenAddress: item.tokenAddress,
        tokenIds: [Number(item.tokenId)],
        tokenBalances: [],
      }
      chainParams.push(params)
    })

    //根据相同的元素 过滤出原来数组的元素
    erc721SameArr.forEach((itemAddress, index) => {
      //得到相同的元素
      const list = erc721Arr.filter((a) => a.tokenAddress == itemAddress)
      const ids = list.map((item) => {
        return Number(item.tokenId)
      })
      const params = {
        tokenStd: 1,
        tokenAddress: itemAddress,
        tokenIds: ids,
        tokenBalances: [],
      }
      chainParams.push(params)
    })

    //查找erc721相同的数组
    const erc1155Arr = listCard.filter((a) => a.tokenStd == 2)
    const erc1155Address = erc1155Arr.map((item) => {
      return item.tokenAddress
    })
    const erc1155SameArr = erc1155Address.filter((elem, index, arr) => arr.indexOf(elem) !== index)

    console.log('---重复的1155 token', erc1155SameArr, erc1155SameArr.length)
    //查找其他相同的元素，剔除相同的这些 地址的元素
    const erc1155NoSameArr = erc1155Arr.filter((a) => !erc1155SameArr.includes(a.tokenAddress))
    console.log('---不重复的 1155 token', erc1155NoSameArr)
    erc1155NoSameArr.forEach((item, index) => {
      const params = {
        tokenStd: 2,
        tokenAddress: item.tokenAddress,
        tokenIds: [Number(item.tokenId)],
        tokenBalances: [item.tokenBalance],
      }
      chainParams.push(params)
    })
    //根据相同的元素数组 ，过滤出原来数组的元素
    erc1155SameArr.forEach((itemAddress, index) => {
      //得到相同的元素
      const list = erc1155Arr.filter((a) => a.tokenAddress == itemAddress)
      const ids = list.map((item) => {
        return Number(item.tokenId)
      })
      const balances = list.map((item) => {
        return item.tokenBalance
      })
      const params = {
        tokenStd: 2,
        tokenAddress: itemAddress,
        tokenIds: ids,
        tokenBalances: balances,
      }
      chainParams.push(params)
    })

    //查找原生币
    let payAmount = BigInt(0)
    const nativeObj = listCard.find((a) => a.tokenStd == 3)
    console.log('--原生---', nativeObj)
    if (nativeObj) {
       payAmount =
         (BigInt(nativeObj.tokenBalance * Math.pow(10, Number(10))) *
           BigInt(Math.pow(10, Number(nativeObj.decimals)))) /
         BigInt(Math.pow(10, Number(10)))

      // payAmount =
      //   BigInt(nativeObj.tokenBalance) * BigInt(Math.pow(10, Number(nativeObj.decimals)))
      
    }

    //查找erc20
    const erc20Arr = listCard.filter((a) => a.tokenStd === 0)
    console.log('--查找erc20---', erc20Arr)
    erc20Arr.forEach((element) => {
      // const tempAmout = element.tokenBalance * Math.pow(10, Number(element.decimals))
      // const amount = BigInt(tempAmout)

        const amount =
          (BigInt(element.tokenBalance * Math.pow(10, Number(10))) *
            BigInt(Math.pow(10, Number(element.decimals)))) /
          BigInt(Math.pow(10, Number(10)))
      
      

      const params = {
        tokenStd: 0,
        tokenAddress: element.tokenAddress,
        tokenBalances: [amount],
        tokenIds: [],
      }
      chainParams.push(params)
    })

    //发起swap的上链请求
    showLoading()
    console.log('最终上链参数', chainParams)
    write({
      value: payAmount,
      args: [BigInt(id), chainParams],
    })
  }
  return (
    <div className="">
      <div className="flex flex-col m-4 rounded-2xl bg-homeItemBgColor">
        <span className="m-2 text-2xl text-center text-white">{t('request-swap')}</span>
        <div className="">
          <AddressText addressOrTx={makerOwner}></AddressText>
        </div>

        <div className="p-3 min-h-40 m-3 border-0.5 border-white border-solid rounded-30 bg-gradient-to-r from-gradSwapTopColor to-gradSwapBottomColor ">
          {loading ? (
            <Skeleton
              className="bg-white bg-opacity-20 "
              avatar
              paragraph={{ rows: 4 }}
              active
            ></Skeleton>
          ) : (
            <div className="grid grid-cols-4 gap-2 min-h-40 gap-y-2 lg:gap-y-5">
              {listTopCard.map((item: any, index: number) => {
                return (
                  <CardItem
                    cardData={item}
                    rectBackground="rgba(255,255,255,0.1)"
                    key={`${item.tokenId}${index}`}
                  />
                )
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col p-3 m-3 border-0.5 border-white border-solid rounded-30 ">
          <div className="grid grid-cols-4 gap-2 gap-y-5 ">
            {listCard.map((item, index) => {
              return (
                <CardItem
                  deleteToken={deleteToken}
                  showDelete={true}
                  cardData={item}
                  key={`${item.tokenId}${index}`}
                />
              )
            })}
            <div key="1" className="flex items-center justify-center">
              <Link href="/selectToken">
                <img className="w-16 h-16 rounded-full" src={IconAdd.src} alt="" />
              </Link>
            </div>
          </div>
          <span className="mt-2 mb-2 text-white opacity-60">select nft/erc1155/tokens</span>
        </div>
        <div className="flex flex-row justify-around">
          <Button
            onClick={cancelSwap}
            shape="round"
            color="white"
            className="w-40 h-8 m-2 text-white bg-white border-none bg-opacity-30 lg:w-96"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={requestSwap}
            shape="round"
            type="primary"
            className="w-40 h-8 m-2 bg-gradient-to-r from-gradLeftColor to-gradRightColor lg:w-96"
          >
            {t('request')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Request
