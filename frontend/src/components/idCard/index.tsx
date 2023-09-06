import { tokenCheck, tokenFind, tokenInfo } from '@/api/contract'
import IconIdDelete from '@/common/images/icon/icon-id-delete.png'
import IconIdSuccess from '@/common/images/icon/icon-id-success.png'
import logo from '@/common/images/logo.png'
import { CloseOutlined } from '@ant-design/icons'
import { Image, Modal, message } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  deleteTokenId: (obj) => void
  tokenIdStatus: (boolStatus: boolean) => void
  tokenItem?: any
}
function IdCard(props: IProps) {
  const { t, i18n } = useTranslation()

  const { address, isConnected } = useAccount()
  const [isSuccess, setSuccess] = useState(false)
  const { tokenItem, tokenIdStatus } = props

  const [tokenObj, setTokenObj] = useState<any>(null) //查询到的token的具体对象
  const tokenIdPlaceHolder = t('input-tokenId-placeholder')

  const deleteItem = () => {
    props.deleteTokenId(tokenItem)
  }

  const successClick = () => {
    //点击了正确按钮，弹窗显示nft
    Modal.success({
      centered: true,
      icon: null,
      width: 300,
      modalRender: (node) => (
        <div
          className="flex flex-col items-center justify-center bg-white rounded-xl w-80 "
          style={{ pointerEvents: 'auto' }}
        >
          <div className="relative flex items-center justify-center w-full mt-5 mb-10 ">
            <span className="text-xl">{tokenObj.standard == 1 ? 'NFT' : 'ERC1155'}</span>
            <CloseOutlined
              onClick={Modal.destroyAll}
              className="absolute top-0 right-3"
              color="black"
              size={32}
            />
          </div>
          <Image
            placeholder={
              <div className="z-10 w-24 h-24 bg-gray-500 rounded-full lg:w-32 lg:h-32 "></div>
            }
            className="rounded-full "
            preview={false}
            fallback={logo.src}
            rootClassName="z-10 w-24 h-24 rounded-full my-10  lg:w-32 lg:h-32 "
            src={tokenObj?.tokenImage}
          ></Image>
        </div>
      ),
      footer: null,
    })
  }

  const bluerEvent = async () => {
    console.log('失去焦点查询')
    if (!tokenItem.tokenId) {
      message.error('请输入tokenId')
      setSuccess(false)
      return
    }
    const params = {
      chain: 'bsc',
      tokenAddress: tokenItem.tokenAddress,
      ownerAddress: address as `0x${string}`,
      tokenId: Number(tokenItem.tokenId),
    }
    try {
      //查询这个token是否存在
      const result = await tokenCheck(params)
      if (result.data) {
        //查询token具体信息，可以得到图片
        const tokenMessage = await tokenInfo(params)
        //设置查询到的具体对象
        setTokenObj(tokenMessage.data)
        tokenItem.tokenImage = tokenMessage.data.tokenImage
        setSuccess(true)
        //回调成功状态到父组件
        tokenIdStatus(true)
      } else {
        setSuccess(false)
        //回调失败状态到父组件
        tokenIdStatus(false)
      }
    } catch (error) {
      message.error('输入的tokenId错误')
      setSuccess(false)
    }
  }
  const inputChange = (event) => {
    tokenItem.tokenId = event.target.value
    // console.log('根据输入的值判断是否有效')
  }
  return (
    <div className="flex flex-row items-center">
      <span className="m-2 text-white">ID #</span>
      <div className="flex items-center flex-1 h-10 bg-white bg-opacity-25 rounded-full">
        <input
          onBlur={bluerEvent}
          onChange={inputChange}
          className="flex-1 w-full px-2 text-white bg-transparent border-none shadow-none outline-none "
          placeholder={tokenIdPlaceHolder}
        ></input>
      </div>
      <img
        onClick={isSuccess ? successClick : deleteItem}
        className="w-10 h-10 m-2 rounded-full "
        src={isSuccess ? IconIdSuccess.src : IconIdDelete.src}
        alt=""
      />
    </div>
  )
}
export default IdCard
