import AddressText from '@/components/addressText'
import CardItem from '@/components/cardItem'
import { formatTimestamp } from '@/utils'
import IconTrasfer from '@/common/images/icon/icon-transfer.png'
import { useCallback, useEffect, useRef, useState } from 'react'
import { hideLoading, showLoading } from '@/utils'
import { makerDeal } from '@/api/deal'
import { useTranslation } from 'react-i18next'
const bscContract = process.env.NEXT_PUBLIC_BSC_SWAP_CONTRACT as string

export async function getServerSideProps(context) {
  const { id } = context.query
  return {
    props: {
      id,
    },
  }
}

function SwapDetail({ id }) {
  const { t, i18n } = useTranslation()

  const [loading, setLoading] = useState(true)
  const [takerData, setTakerData] = useState<any>(null)
  const [makerData, setMakerData] = useState<any>(null)
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
      //设置数据
      setTakerData(result.data.taker)
      setMakerData(result.data.maker)
    } catch (error) {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log('---开始加载--loadData')
    loadData()
  }, [])

  return (
    <div className="">
      <div className="relative flex flex-col m-4 rounded-30 bg-homeItemBgColor">
        <span className="m-2 text-xl text-center text-white">{t('swap-success')}</span>
        <div className="mt-4">
          <AddressText addressOrTx={makerData?.owner}></AddressText>
        </div>
        <div className="p-3 m-3 border-0.5 border-white border-solid rounded-30 bg-gradient-to-r from-gradSwapTopColor to-gradSwapBottomColor ">
          <div className="grid grid-cols-4 gap-2 gap-y-2 lg:gap-y-5">
            {makerData?.tokens.map((item, index) => {
              return <CardItem cardData={item} key={`${item.tokenId}${index}`} />
            })}
          </div>
        </div>
        <div className="flex items-center justify-center">
          <img className="w-6 h-6 rounded-full lg:w-10 lg:h-10" src={IconTrasfer.src} alt="" />
        </div>
        <div className="mt-4">
          <AddressText addressOrTx={takerData?.owner}></AddressText>
        </div>
        <div className="flex flex-col  p-3 m-3   border-solid border-0.5 border-white rounded-30 ">
          <div className="grid grid-cols-4 gap-2 gap-y-5 lg:gap-y-5">
            {takerData?.tokens.map((item, index) => {
              return <CardItem cardData={item} key={`${item.tokenId}${index}`} />
            })}
          </div>
          {/* <span className="mt-2 mb-2 text-sm text-white opacity-60">
            有效时间:{itemData.swapEnd != 0 ? formatTimestamp(itemData.swapEnd) : '不限期'}
          </span> */}
        </div>
      </div>
    </div>
  )
}

export default SwapDetail
