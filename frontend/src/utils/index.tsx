import { Modal, Spin } from 'antd'

export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000) // timestamp 需要乘以 1000

  const year = date.getFullYear()
  const month = `0${date.getMonth() + 1}`.slice(-2) // 月份需要加 1
  const day = `0${date.getDate()}`.slice(-2)
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// const formattedDate = formatTimestamp(1637227036)
// 2021-11-26 15:35:36

export const showLoading = () => {
  Modal.info({
    title: '',
    icon: null,
    centered: true,
    modalRender: () => (
      <Spin tip="Loading" size="large" className="text-white ">
        <div className="bg-white bg-opacity-25 content" />
      </Spin>
    ),
    footer: null,
  })
}

export const hideLoading = () => {
  Modal.destroyAll()
}
