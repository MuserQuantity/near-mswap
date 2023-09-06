import IconTokenDelete from '@/common/images/icon/icon-token-delete.png'
import logo from '@/common/images/logo.png'

import { Image } from 'antd'
import { memo } from 'react'
interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  deleteToken?: (obj: any) => void
  showDelete?: boolean
  rectBackground?: string
  idColor?: string
  cardData?: any
}

const tokenIdShow = (item) => {
  switch (item.tokenStd) {
    case 0:
      //erc20
      return `${item.tokenBalance} ${item.tokenSymbol}`
    case 1:
      //erc721
      return `#${item.tokenId}`
    case 2:
      //erc1155
      return ` ${item.tokenBalance}  #${item.tokenId}`
    case 3:
      //原生币
      return `${item.tokenBalance} ${item.tokenSymbol}`
  }
}
function CardItem({
  idColor = '#fff',
  rectBackground = '#2E2E2E',
  showDelete,
  deleteToken,
  cardData = {},
}: IProps) {
  console.log('CardItem渲染了')
  const deleteItem = () => {
    if (deleteToken) {
      deleteToken(cardData)
    }
  }
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* <img
        className="z-10 w-16 h-16 rounded-full lg:w-32 lg:h-32 "
        src={cardData.tokenImage}
        alt=""
      /> */}
      <Image
        placeholder={
          <div
            style={{ background: rectBackground }}
            className="z-10 w-16 h-16 rounded-full lg:w-32 lg:h-32 "
          ></div>
        }
        className="rounded-full"
        preview={false}
        fallback={logo.src}
        rootClassName="z-10 w-16 h-16  lg:w-32 lg:h-32 "
        src={cardData.tokenImage}
      ></Image>
      <div
        className="flex flex-col items-center w-full -mt-8 rounded-md lg:-mt-16 lg:h-40 "
        style={{ background: rectBackground }}
      >
        <span
          className="w-full py-4 mt-8 text-sm text-center break-all line-clamp-3 lg:mt-16 "
          style={{ color: idColor }}
        >
          {tokenIdShow(cardData)}
        </span>
      </div>
      {showDelete ? (
        <img
          onClick={deleteItem}
          className="absolute top-0 right-0 z-20 w-6 h-6 rounded-full lg:w-10 lg:h-10"
          src={IconTokenDelete.src}
          alt=""
        />
      ) : null}
    </div>
  )
}
export default memo(CardItem)
