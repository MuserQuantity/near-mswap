import { Button, Empty, Modal, Skeleton, message, notification } from 'antd'
import CardItem from '../cardItem'
import Link from 'next/link'
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { makerList } from '@/api/deal'
import { formatTimestamp, hideLoading, showLoading } from '@/utils'
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi'
import ListLoading from '../listLoading'
import NoMoreData from '../nomoreData'
import router from 'next/router'
import { metaswapV1ContractConfig } from '@/abi/metaswap'

import StatusShow from '../statusShow'
import { useImmer } from 'use-immer'
import { useTranslation } from 'react-i18next'

const bscContract = process.env.NEXT_PUBLIC_BSC_SWAP_CONTRACT as string

const ListItem = ({ itemData }) => {
  const { t, i18n } = useTranslation()

  const [itemObj, setItemObj] = useImmer(itemData)
  const [api, contextHolder] = notification.useNotification()
  type NotificationType = 'success' | 'info' | 'warning' | 'error'
  const [open, setOpen] = useState(false)
  const listCard = itemData.tokens
  const { write, data } = useContractWrite({
    ...metaswapV1ContractConfig,
    functionName: 'closeSwapDeal',
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

  //查询swap success成功的详情
  const goSwapSuccess = () => {
    router.push('/swapDetail/[id]', `/swapDetail/${itemData.dealId}`)
  }

  //点击确认取消
  const confirmCancel = () => {
    hideModal()
    showLoading()
    write({
      args: [BigInt(itemData.dealId)],
    })
  }

  const hideModal = () => {
    setOpen(false)
  }
  const cancelSwap = () => {
    setOpen(true)
  }

  //查看请求swap的列表
  const goRequestOffers = () => {
    //先存储这些对象到本地
    localStorage.setItem('itemData', JSON.stringify(itemData))

    router.push('/requestOffers/[id]', `/requestOffers/${itemData.dealId}`)
  }

  return (
    <div>
      {contextHolder}
      <div className="relative flex flex-col m-4 rounded-30 bg-homeItemBgColor">
        {useMemo(
          () => (
            <StatusShow status={itemObj.status}></StatusShow>
          ),
          [itemObj.status]
        )}

        <div className="grid grid-cols-4 gap-2 mt-12 gap-y-5 ">
          {listCard.map((item: any, index) => {
            return <CardItem cardData={item} key={`${item.tokenId}${index}`} />
          })}
        </div>
        <span className="mt-6 mb-4 text-sm text-white text-opacity-40">
          {t('common-audit-time')}:
          {itemObj.swapEnd != 0 ? formatTimestamp(itemObj.swapEnd) : `${t('date-unlimited')}`}
          {/* 有效时间:{itemObj.swapEnd != 0 ? formatTimestamp(itemObj.swapEnd) : '不限期'} */}
        </span>
        {itemObj.status == 0 ? (
          <div className="flex flex-row justify-around mb-4">
            <Button
              onClick={cancelSwap}
              shape="round"
              color="white"
              className="w-40 h-8 m-2 text-white bg-white border-none bg-opacity-30 lg:w-96"
            >
              {t('cancel')}
            </Button>

            <Button
              onClick={goRequestOffers}
              shape="round"
              type="primary"
              className="w-40 h-8 m-2 border-none bg-gradient-to-r from-gradLeftColor to-gradRightColor lg:w-96"
            >
              {t('request-offers')}
            </Button>
          </div>
        ) : itemObj.status == 2 ? (
          <div className="flex flex-row justify-around mb-4">
            <Button
              onClick={goSwapSuccess}
              shape="round"
              color="white"
              className="w-40 h-8 m-2 text-white bg-white border-none bg-opacity-30 lg:w-96"
            >
              View
            </Button>
          </div>
        ) : null}
      </div>

      <Modal
        centered={true}
        title="Cancel Request"
        onCancel={hideModal}
        open={open}
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
              Cancel
            </Button>
            <Button
              onClick={confirmCancel}
              shape="round"
              className="flex items-center justify-center w-10/12 h-10 m-2 text-xl font-bold text-white border-none lg:text-2xl bg-gradient-to-r from-gradLeftColor to-gradRightColor lg:w-96"
            >
              Confirm
            </Button>
          </div>
        }
      >
        <span>Please confrm to cancel your request</span>
      </Modal>
    </div>
  )
}

function MineList() {
    const { t, i18n } = useTranslation()

  const { address, isConnected } = useAccount()
  const [items, setItems] = useState([])
  const [loadMore, setLoaderMore] = useState(false) //是否加载更多
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<number>(1)
  const prevDataRef = useRef([]) //用来存上一页的数据
  const loadData = useCallback(async () => {
    // 加载 API 数据,传入页码参数
    const parmas = {
      page: page,
      size: 10,
      chain: 'bsc',
      owner: address,
      contract: bscContract,
    }
    try {
      const result = await makerList(parmas)
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
      setLoaderMore(false)
    }
  }, [page])

  useEffect(() => {
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
            <span className="text-white">{t('nodata')}</span>
          </Empty>
        </div>
      ) : (
        <div className="">
          {items.map((item, index) => {
            return <ListItem itemData={item} key={index} />
          })}
        </div>
      )}
    </InfiniteScroll>
  )
}

export default MineList
