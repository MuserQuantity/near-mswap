import { Skeleton } from 'antd'
import { memo } from 'react'

function ListLoading({ rows = 1 }: { rows?: number }) {
  const numbers: number[] = []
  for (let i: number = 0; i < rows; i++) {
    numbers.push(i)
  }
  return (
    <div className="flex flex-col">
      {numbers.map((item, index) => {
        return (
          <Skeleton
            key={index}
            className="mt-1 bg-white bg-opacity-20 "
            avatar
            paragraph={{ rows: 4 }}
            active
          ></Skeleton>
        )
      })}
    </div>
  )
}
export default memo(ListLoading)
