import iconAddToken from '@/common/images/icon/icon-add-token.png'
import logo from '@/common/images/logo.png'

import { Image } from 'antd'

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  addTokenId: () => void
  tokenObj?: any
}

const ercShow = (standard) => {
  switch (standard) {
    case 0:
      return 'ERC20'

    case 1:
      return 'ERC721'

    case 2:
      return 'ERC1155'
    case 3:
      return ''
  }
}

function TokenCard(props: IProps) {
  const { tokenObj } = props

  return (
    <div className="flex flex-row items-center p-2">
      {/* <img className="w-16 h-16 rounded-full lg:w-32 lg:h-32 " src={tokenObj.logo} alt="" /> */}
      <Image
        className="rounded-full"
        preview={false}
        fallback={logo.src}
        rootClassName="z-10 w-16 h-16  lg:w-32 lg:h-32 "
        src={tokenObj.logo}
      ></Image>
      <div className="flex flex-col flex-1 ml-3">
        <span className="text-lg text-white">{tokenObj.symbol}</span>
        <div className="flex flex-row mt-2">
          <span
            style={{ display: tokenObj.standard == 3 ? 'none' : 'flex' }}
            className="mr-4 text-sm text-white text-opacity-25"
          >
            {ercShow(tokenObj.standard)}
          </span>
          <span
            style={{ display: tokenObj.standard == 2 ? 'none' : 'flex' }}
            className="text-sm text-white text-opacity-25 "
          >
            Balance:{tokenObj.balance ?? 0}
          </span>
        </div>
      </div>
      <img
        style={{ display: tokenObj.standard == 0 || tokenObj.standard == 3 ? 'none' : 'flex' }}
        onClick={props.addTokenId}
        className="w-10 h-10 m-2 rounded-full "
        src={iconAddToken.src}
        alt=""
      />
    </div>
  )
}
export default TokenCard
