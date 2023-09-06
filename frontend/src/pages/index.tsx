import { makerList } from '@/api/deal'
import { useCallback, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import HomeItem from '@/components/homeItem'
import BottomNav from '@/components/bottomNav'
import { ConfigProvider, Empty, Skeleton, message } from 'antd'
import { useAccount } from 'wagmi'
import NoMoreData from '@/components/nomoreData'
import ListLoading from '@/components/listLoading'
import { useTranslation } from 'react-i18next'
const bscContract = process.env.NEXT_PUBLIC_BSC_SWAP_CONTRACT as string
export default function Index() {
  const [items, setItems] = useState([])
  const { t, i18n } = useTranslation()

  const [loadMore, setLoaderMore] = useState(false) //控制加载更多的显示
  const [loading, setLoading] = useState(true) //首次整体加载loading
  const [page, setPage] = useState<number>(1)
  const prevDataRef = useRef([]) //用来存上一页的数据

  const changeLanguages = () => {
    i18n.changeLanguage('en')
    localStorage.setItem('lang', 'en')
  }

  const loadData = useCallback(async () => {
    // 加载 API 数据,传入页码参数
    console.log('开始加载', page)
    const parmas = {
      page: page,
      size: 10,
      chain: 'bsc',
      contract: bscContract,
    }
    try {
      const result = await makerList(parmas)
      const list = result.data.list as []
      setLoading(false)
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
      message.error('数据加载error')
    }
  }, [page])

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-center ">
        {/* <span className="text-center text-white">LISTING CENTER</span> */}
        <span className="text-center text-white">{t('home-title')}</span>
      </div>
      <InfiniteScroll
        className="overflow-hidden"
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
          <Empty description={false} className="text-white" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <span className="text-white">暂无数据</span>
          </Empty>
        ) : (
          <div className="ml-4 mr-4">
            {items.map((item, index) => {
              return <HomeItem itemData={item} key={index} />
            })}
          </div>
        )}
      </InfiniteScroll>
      <BottomNav />
    </div>
  )
}
