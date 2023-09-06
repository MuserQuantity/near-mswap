import CardItem from '@/components/cardItem'
import { Button, Empty, Modal, Skeleton, message, notification } from 'antd'
import Link from 'next/link'
import IconTrasfer from '@/common/images/icon/icon-transfer.png'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { takerList } from '@/api/deal'
import InfiniteScroll from 'react-infinite-scroll-component'
import { formatTimestamp, hideLoading, showLoading } from '@/utils'
import {
  useAccount,
  useContractWrite,
  useNetwork,
  useSwitchNetwork,
  useWaitForTransaction,
} from 'wagmi'
import NoMoreData from '../nomoreData'
import ListLoading from '../listLoading'
import AddressText from '../addressText'

import { metaswapV1ContractConfig } from '@/abi/metaswap'

import StatusShow from '../statusShow'
import { useImmer } from 'use-immer'
import { useTranslation } from 'react-i18next'
const bscContract = process.env.NEXT_PUBLIC_BSC_SWAP_CONTRACT as string

function MineRequest() {
    const { t, i18n } = useTranslation()

  const { address, isConnected, connector } = useAccount()
  const { chain, chains } = useNetwork()
  const { error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  const [items, setItems] = useState([])
  const [loadMore, setLoaderMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<number>(1)
  const prevDataRef = useRef([]) //用来存上一页的数据

  const loadData = useCallback(async () => {
    // 加载 API 数据,传入页码参数
    const parmas = {
      page: page,
      size: 10,
      chain: 'bsc',
      withMaker: true,
      owner: address,
      contract: bscContract,
    }
    try {
      const result = await takerList(parmas)
      setLoading(false)
      const list = result.data.list as []
      if (list.length == 0) {
        setLoaderMore(false)
        return
      }

      setItems((prevData) => [...prevData, ...list])
      prevDataRef.current = [...prevDataRef.current, ...list]
      if (list.length < 10) {
        setLoaderMore(false)
        return
      }
      setPage((prevPage) => prevPage + 1)
      setLoaderMore(true)
    } catch (error) {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    console.log('开始加载')
    loadData()
  }, [])

  return (
    <InfiniteScroll
      className="flex-1 overflow-hidden"
      loader={
        <Skeleton className="mt-1 bg-white bg-opacity-20" avatar paragraph={{ rows: 3 }} active />
      }
      endMessage={<NoMoreData show={!loadMore && page != 1}></NoMoreData>}
      dataLength={items.length}
      next={loadData}
      hasMore={loadMore}
    >
      {loading ? (
        <ListLoading rows={4}></ListLoading>
      ) : items.length == 0 && page == 1 ? (
        <div className="flex items-center justify-center mt-40">
          <Empty description={false} className="text-white" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <span className="text-white">{ t('nodata')}</span>
          </Empty>
        </div>
      ) : (
        <div className="">
          {items.map((item, index) => {
            return <RequestItem itemData={item} key={index} />
          })}
        </div>
      )}
    </InfiniteScroll>
  )
}

// 每个Item组件
function RequestItem({ itemData }) {
  const { t, i18n } = useTranslation()

  const [itemObj, setItemObj] = useImmer(itemData)
  const [api, contextHolder] = notification.useNotification()
  type NotificationType = 'success' | 'info' | 'warning' | 'error'
  const [open, setOpen] = useState(false)
  const listTopCard = itemData.makerDeal == null ? [] : itemData.makerDeal.tokens
  const listMyCard = itemData.tokens
  //用于取消swap的合约
  const { write, data } = useContractWrite({
    ...metaswapV1ContractConfig,
    functionName: 'cancelSwapDeal',
    onError(error) {
      console.log('Error', error)
      hideLoading()
      api['error']({
        message: 'transcation result',
        description: 'request fail',
      })
    },
  })
  //交易监听
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess(dataResult) {
      console.log('监听交易是否成功', dataResult)
      hideLoading()
      api['success']({
        message: 'transcation success',
        description: data?.hash,
      })
      setItemObj((obj) => {
        obj.status = 1
      })
    },
    onError(err) {
      console.log('监听交易失败', err)
      hideLoading()
      message.error(t('toast-block-fail'))
    },
  })

  const hideModal = () => {
    setOpen(false)
  }
  const cancelSwap = () => {
    setOpen(true)
  }

  //点击确认取消
  const confirmCancel = () => {
    hideModal()
    showLoading()
    write({
      args: [BigInt(itemData.dealId), BigInt(itemData.dealTid)],
    })
  }

  return (
    <div className="">
      {contextHolder}
      <div className="relative flex flex-col m-4 rounded-30 bg-homeItemBgColor">
        {useMemo(
          () => (
            <StatusShow status={itemObj.status}></StatusShow>
          ),
          [itemObj.status]
        )}

        <div className="mt-4">
          {useMemo(
            () => (
              <AddressText addressOrTx={itemObj.makerDeal.owner}></AddressText>
            ),
            [itemObj.makerDeal.owner]
          )}
        </div>
        <div className="p-3 m-3 border-0.5 border-white border-solid rounded-30 bg-gradient-to-r from-gradSwapTopColor to-gradSwapBottomColor ">
          <div className="grid grid-cols-4 gap-2 gap-y-2 lg:gap-y-5">
            {useMemo(
              () =>
                listTopCard.map((item, index) => {
                  return <CardItem cardData={item} key={`${item.tokenId}${index}`} />
                }),
              [listTopCard]
            )}
          </div>
        </div>
        <div className="flex items-center justify-center">
          <img className="w-6 h-6 rounded-full lg:w-10 lg:h-10" src={IconTrasfer.src} alt="" />
        </div>
        <div className="flex flex-col  p-3 m-3   border-solid border-0.5 border-white rounded-30 ">
          <div className="grid grid-cols-4 gap-2 gap-y-5 lg:gap-y-5">
            {listMyCard.map((item, index) => {
              return <CardItem cardData={item} key={`${item.tokenId}${index}`} />
            })}
          </div>
          <span className="mt-2 mb-2 text-sm text-white opacity-60">
            {t('common-audit-time')}:
            {itemObj.swapEnd != 0 ? formatTimestamp(itemObj.swapEnd) : `${t('date-unlimited')}`}
            {/* 有效时间:{itemObj.swapEnd != 0 ? formatTimestamp(itemObj.swapEnd) : '不限期'} */}
          </span>
        </div>
        <div
          className="flex flex-row justify-around"
          style={{ display: itemObj.status == 0 ? 'flex' : 'none' }}
        >
          <Button
            onClick={isLoading ? () => {} : cancelSwap}
            shape="round"
            color="white"
            className="w-10/12 h-8 my-4 text-white bg-white border-none bg-opacity-30 lg:w-96"
          >
            {isLoading ? 'Loading...' : `${t('cancel')}`}
          </Button>
        </div>
      </div>
      <Modal
        centered={true}
        title="Cancel Request"
        open={open}
        onCancel={hideModal}
        okButtonProps={{ color: '#000', type: 'primary' }}
        okText="确认"
        cancelText="取消"
        footer={
          <div className="flex flex-row">
            <Button
              onClick={hideModal}
              shape="round"
              color="white"
              className="flex items-center justify-center w-10/12 h-10 m-2 text-xl font-bold text-white bg-gray-500 border-none lg:w-96"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={confirmCancel}
              shape="round"
              className="flex items-center justify-center w-10/12 h-10 m-2 text-xl font-bold text-white border-none lg:text-2xl bg-gradient-to-r from-gradLeftColor to-gradRightColor lg:w-96"
            >
              {t('confirm')}
            </Button>
          </div>
        }
      >
        <span>Please confrm to cancel your request</span>
      </Modal>
    </div>
  )
}

export default MineRequest
