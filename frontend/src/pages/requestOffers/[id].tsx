import CardItem from '@/components/cardItem'
import { Button, ConfigProvider, Empty, Modal, Skeleton, message } from 'antd'
import Link from 'next/link'
import IconTrasfer from '@/common/images/icon/icon-transfer.png'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CloseOutlined } from '@ant-design/icons'
import router, { useRouter } from 'next/router'
import { takerList, userfee } from '@/api/deal'
import InfiniteScroll from 'react-infinite-scroll-component'
import { formatTimestamp, hideLoading, showLoading } from '@/utils'
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi'
import NoMoreData from '@/components/nomoreData'
import ListLoading from '@/components/listLoading'
import AddressText from '@/components/addressText'
import { metaswapV1ContractConfig } from '@/abi/metaswap'
import StatusShow from '@/components/statusShow'
import { useTranslation } from 'react-i18next'
const bscContract = process.env.NEXT_PUBLIC_BSC_SWAP_CONTRACT as string

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  showSwap?: boolean
  clickSwap?: (itemData) => void
  itemData?: any
}

export async function getServerSideProps(context) {
  const { id } = context.query

  return {
    props: {
      id,
    },
  }
}

function RequestOffers({ id }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const showModal = useCallback(
    (itemData) => {
      setTakerData(itemData)
      setOpen(true)
    },
    [open]
  )

  const hideModal = () => {
    console.log('关闭swap')
    setOpen(false)
  }
  const [loading, setLoading] = useState(true) //加载状态
  const [makerData, setMakerData] = useState(null) //设置maker的对象
  const [takerData, setTakerData] = useState(null) //设置taker的对象,点击弹窗需要
  const [listCard, setListCard] = useState<any>([]) //列表的数据
  const [loadMore, setLoaderMore] = useState(false) //显示加载更多
  const [page, setPage] = useState<number>(1)
  const prevDataRef = useRef([]) //用来存上一页的数据

  const loadData = useCallback(async () => {
    // 加载 API 数据,传入页码参数
    const parmas = {
      page: page,
      size: 10,
      chain: 'bsc',
      withMaker: true,
      dealId: Number(id),
      contract: bscContract,
    }

    try {
      const result = await takerList(parmas)
      setLoading(false)
      const list = result.data.list as []
      if (list.length == 0) {
        console.log('---没有数据了', page)
        setLoaderMore(false)
        return
      }
      //设置maker的对象
      const makerObj = result.data.list[0].makerDeal
      setMakerData(makerObj)
      //设置列表数据

      setListCard((prevData) => [...prevData, ...list])
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
      message.error(t('toast-load-error'))
    }
  }, [page])
  useEffect(() => {
    console.log('---开始加载--loadData')
    loadData()
    //获取本地数据
    const myItemStr = localStorage.getItem('itemData')
    if (myItemStr) {
      setMakerData(JSON.parse(myItemStr))
    }
  }, [])

  return (
    <div>
      <Modal
        maskClosable={false}
        centered={true}
        open={open}
        width={800}
        modalRender={(node) => (
          <RenderCustomModal makerData={makerData} takerData={takerData} onCancel={hideModal} />
        )}
      ></Modal>
      {loading ? (
        <Skeleton className="mt-1 bg-white bg-opacity-20" avatar paragraph={{ rows: 3 }} active />
      ) : (
        //可能没有列表，就没有数据了
        <RequestOfferItem itemData={makerData} showSwap={false} />
      )}

      <div className="flex items-center justify-center">
        <span className="my-2 text-lg font-bold text-center text-white">{t('request-offers')}</span>
      </div>
      <InfiniteScroll
        className="flex-1 overflow-hidden"
        loader={
          <Skeleton className="mt-1 bg-white bg-opacity-20" avatar paragraph={{ rows: 3 }} active />
        }
        endMessage={<NoMoreData show={!loadMore && page != 1}></NoMoreData>}
        dataLength={listCard.length}
        next={loadData}
        hasMore={loadMore}
      >
        {loading ? (
          <ListLoading rows={4}></ListLoading>
        ) : listCard.length == 0 && page == 1 ? (
          <Empty description={false} className="text-white" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <span className="text-white">{t('nodata')}</span>
          </Empty>
        ) : (
          <div className="">
            {listCard.map((item: any, index: number) => {
              return (
                <RequestOfferItem clickSwap={showModal} itemData={item} key={`${item}${index}`} />
              )
            })}
          </div>
        )}
      </InfiniteScroll>
    </div>
  )
}

//自定义弹窗
const RenderCustomModal: React.FC<ModalRenderProps> = ({ onCancel, makerData, takerData }) => {
  const { t, i18n } = useTranslation()
  const listTopCard = makerData.tokens ?? []
  const listBottomCard = takerData.tokens ?? []
  const { address, isConnected } = useAccount()

  console.log('交换的数据', makerData, takerData)
  const { write, data } = useContractWrite({
    ...metaswapV1ContractConfig,
    functionName: 'confirmSwapDeal',
    value: BigInt(0),
    onError(error) {
      console.log('Error', error)
      hideLoading()
      message.error(t('toast-fail'))
    },
  })

  const closeSuccessModal = () => {
    Modal.destroyAll()
    router.back()
  }
  //交易监听
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess(data) {
      console.log('监听交易是否成功', data)
      hideLoading()
      //提示交易成功
      Modal.success({
        centered: true,
        icon: null,
        // title: 'Confirm Success',
        title: (
          <div className="flex items-center justify-center">
            <span>{t('confirm-swap')}</span>
          </div>
        ),
        content: (
          <div className="flex flex-col items-center justify-center">
            <span className="text-lg text-center">Transaction Submitted</span>
            <span className="text-lg text-center text-blue-400">View on BscScan</span>
          </div>
        ),
        footer: (
          <div className="flex flex-row justify-center my-4">
            <Button
              onClick={closeSuccessModal}
              shape="round"
              style={{ background: 'linear-gradient(180deg, #37C1FE 0%, #F432FE 100%)' }}
              className="flex items-center justify-center w-10/12 h-10 text-xl font-bold text-white border-none lg:text-2xl lg:w-96"
            >
              Close
            </Button>
          </div>
        ),
      })
    },
    onError(err) {
      console.log('监听交易失败', err)
      hideLoading()
      message.error(t('toast-block-fail'))
    },
  })

  //点击了确认swap，发起链上交易
  const onConfrimSwap = () => {
    onCancel()
    //发起交易
    showLoading()
    const params = {
      chain: 'bsc',
      contract: bscContract,
      user: address as `0x${string}`,
    }
    userfee(params)
      .then((res) => {
        console.log('手续费', res)
        const amount = BigInt(Number(res.data.fee) * Math.pow(10, Number(res.data.decimals)))
        write({
          value: amount,
          args: [BigInt(takerData.dealId), BigInt(takerData.dealTid)],
        })
      })
      .catch((error) => {
        hideLoading()
        message.error(t('toast-get-fee-error'))
      })
  }
  return (
    <div className="relative flex flex-col bg-white rounded-lg" style={{ pointerEvents: 'auto' }}>
      <span className="m-2 text-2xl text-center text-black">{t('confirm-swap')}</span>
      <div className="absolute right-2 top-2" onClick={onCancel}>
        <CloseOutlined style={{ color: '#000', fontSize: '24px' }} />
      </div>

      <div
        className="p-3 m-3 bg-opacity-50 rounded-30 "
        style={{
          background:
            'linear-gradient(180deg, rgba(221, 68, 254, 0.5) 0%, rgba(63, 187, 254, 0.5) 100%)',
        }}
      >
        <div className="grid grid-cols-4 gap-2 gap-y-2 lg:gap-y-5">
          {listTopCard.map((item, index) => {
            return (
              <CardItem
                cardData={item}
                idColor="#333"
                rectBackground="rgba(255, 255, 255, 0.4)"
                key={`${item}${index}`}
              />
            )
          })}
        </div>
      </div>
      <div className="flex items-center justify-center">
        <img className="w-6 h-6 rounded-full lg:w-10 lg:h-10" src={IconTrasfer.src} alt="" />
      </div>
      <div className="flex flex-col p-3 m-3 rounded-30" style={{ background: '#E9EAEB' }}>
        <div className="my-2">
          <AddressText color="rgba(0,0,0,0.6)" addressOrTx={takerData.owner}></AddressText>
        </div>

        <div className="grid grid-cols-4 gap-2 gap-y-2 lg:gap-y-5">
          {listBottomCard.map((item, index) => {
            return (
              <CardItem
                cardData={item}
                idColor="#333"
                key={`${item}${index}`}
                rectBackground="rgba(255, 255, 255, 0.7)"
              />
            )
          })}
        </div>
      </div>
      <div className="flex flex-row justify-center my-4">
        <Button
          onClick={onConfrimSwap}
          shape="round"
          style={{ background: 'linear-gradient(180deg, #37C1FE 0%, #F432FE 100%)' }}
          className="flex items-center justify-center w-10/12 h-10 text-xl font-bold text-white border-none lg:text-2xl lg:w-96"
        >
          {t('confirm-swap')}
        </Button>
      </div>
    </div>
  )
}
//弹窗的属性设置
interface ModalRenderProps {
  onCancel: () => void

  makerData?: any
  takerData?: any
}

//列表的Item子组件
function RequestOfferItem({ clickSwap, showSwap = true, itemData }: IProps) {
  const listTopCard = itemData?.tokens ?? []
  const { t, i18n } = useTranslation()
  const swap = () => {
    if (clickSwap) {
      clickSwap(itemData)
    }
  }

  return (
    <div className="">
      <div className="relative flex flex-col m-2 rounded-30 bg-homeItemBgColor">
        <StatusShow status={itemData.status}></StatusShow>
        <div className="my-4">
          <AddressText addressOrTx={itemData.owner}></AddressText>
        </div>
        <div className="grid grid-cols-4 gap-2 gap-y-2 lg:gap-y-5">
          {listTopCard.map((item: any, index: number) => {
            return <CardItem cardData={item} key={`${item}${index}`} />
          })}
        </div>
        <span className="my-4 text-sm text-white opacity-40">
          {t('common-audit-time')}:
          {itemData?.swapEnd != 0 ? formatTimestamp(itemData?.swapEnd) : `${t('date-unlimited')}`}
        </span>
        <div
          className="flex items-center justify-center my-2"
          style={{ display: showSwap ? 'flex' : 'none' }}
        >
          <Button
            onClick={swap}
            shape="round"
            color="white"
            style={{
              background: 'linear-gradient(180deg, #DD44FE 0%, #3FBBFE 100%)',
              display: itemData?.status == 0 ? 'flex' : 'none',
            }}
            className="flex items-center justify-center w-10/12 h-10 m-2 text-xl font-bold text-white border-none lg:text-2xl lg:w-96"
          >
            {t('swap')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RequestOffers
