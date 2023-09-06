import { Button } from 'antd'
import CardItem from '../cardItem'
import successIcon from '@/common/images/icon/icon-success.png'
import cancelIcon from '@/common/images/icon/icon-cancel.png'
import Link from 'next/link'
import { resetTokenList } from '@/store/modules/tokenSlice'
import { useAppDispatch } from '@/store'
import { useRouter } from 'next/router'
import { swapIds } from '@/hooks/useContract'
import { metaswapV1ContractConfig } from '@/abi/metaswap'
import { useAccount, useContractRead, useContractWrite } from 'wagmi'
import { formatTimestamp } from '@/utils/index'
import AddressText from '../addressText'
import StatusShow from '../statusShow'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

function HomeItem({ itemData }) {
  const { t, i18n } = useTranslation()

  const dispatch = useAppDispatch()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const goRequest = () => {
    dispatch(resetTokenList(1))
    // router.push('/request/' + itemData.dealId)
    router.push('/request/[id]', `/request/${itemData.dealId}`)
  }
  return (
    <div className="relative flex flex-col w-full mt-4 rounded-30 bg-homeItemBgColor ">
      {useMemo(
        () => (
          <StatusShow status={itemData.status}></StatusShow>
        ),
        [itemData.status]
      )}
      <div className="my-6">
        {useMemo(
          () => (
            <AddressText addressOrTx={itemData.owner}></AddressText>
          ),
          [itemData.owner]
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 gap-y-5">
        {itemData.tokens.map((item, index) => {
          return <CardItem cardData={item} key={index} />
        })}
      </div>
      <span className="my-4 text-sm text-white text-opacity-40">
        {t('common-audit-time')}:
        {itemData.swapEnd != 0 ? formatTimestamp(itemData.swapEnd) : `${t('date-unlimited')}`}
      </span>
      <div
        className="flex justify-center w-full my-2"
        style={{
          display:
            itemData.status == 0 &&
            address?.toLowerCase() != itemData.owner?.toLowerCase() &&
            isConnected
              ? 'flex'
              : 'none',
        }}
      >
        <Button
          onClick={goRequest}
          shape="round"
          className="flex items-center justify-center w-10/12 h-10 m-2 text-xl font-bold text-white border-none lg:text-2xl bg-gradient-to-r from-gradLeftColor to-gradRightColor lg:w-96"
        >
          {itemData.takerDeals == 0 ? t('request') : `${t('request')}(${itemData.takerDeals})`}
        </Button>
      </div>
    </div>
  )
}
export default HomeItem
