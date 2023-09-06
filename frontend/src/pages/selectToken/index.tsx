import IconAdd from '@/common/images/icon/icon-add.png'
import TokenCard from '@/components/tokenCard'
import IdCard from '@/components/idCard'
import { Button, ConfigProvider, Modal, Spin, message } from 'antd'
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'
import { ForwardedRef, forwardRef, useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useAppDispatch } from '@/store'
import { increment, setNewData } from '@/store/modules/tokenSlice'
import { randomInt } from 'crypto'
import { tokenFind, tokenBalance, tokenCheck, tokenAllowance } from '@/api/contract'
import IconIdDelete from '@/common/images/icon/icon-id-delete.png'

import { useImmer } from 'use-immer'
import { erc20ABI, erc721ABI, useAccount, useContractWrite, useSendTransaction } from 'wagmi'
import { BigNumber } from 'ethers'
import { hideLoading, showLoading } from '@/utils'
import Id1155Card from '@/components/id1155Card'
import { useTranslation } from 'react-i18next'

const manageAddress = process.env.NEXT_PUBLIC_MANAGE_CONTRACT as `0x${string}`
function SelectToken() {
  console.log('SelectToken组件渲染了')
  const { t, i18n } = useTranslation()

  const router = useRouter()
  const dispatch = useAppDispatch()
  const { address, isConnected } = useAccount()
  const [listIdCard, setListIdCard] = useState<any[]>([]) //设置要添加的idcard
  const [isShowCard, setIsShowCard] = useState(false) //查询是否有nft
  const [tokenObj, setTokenObj] = useImmer<any>({}) //查询到的对象
  const [isApprove, setApprove] = useState(false) //判断查询到的token是否授权了
  const [idStatus, setIdStatus] = useState(false) //erc721点击confirm的时候需要判断 输入的id 是否全为有效状态

  const inputTokenRef = useRef<HTMLInputElement | null>(null) //设置输入的token
  const inputTokenAmoutRef = useRef<HTMLInputElement | null>(null) //设置输入的token金额
  //使用erc20合约
  const { write, data: writeResult } = useContractWrite({
    address: tokenObj.contract as `0x${string}`,
    abi: erc20ABI,
    functionName: 'approve',
    onError(error) {
      console.log('Error', error)
      message.error(t('toast-approve-fail'))
      hideLoading()
      setApprove(false)
    },
    onSuccess(data) {
      console.log('Success', data)
      hideLoading()
      setApprove(true)
      setErc20NativeData(tokenObj)
    },
  })
  //使用erc721合约
  const { write: write721, data: write721Result } = useContractWrite({
    address: tokenObj.contract as `0x${string}`,
    abi: erc721ABI,
    functionName: 'setApprovalForAll',
    onError(error) {
      console.log('Error', error)
      message.error(t('toast-approve-fail'))
      setApprove(false)
      hideLoading()
    },
    onSuccess(data) {
      console.log('Success', data)
      setApprove(true)
      hideLoading()
      dispatch(increment([...listIdCard]))
      router.back()
    },
  })

  //发送交易的方法
  // const { data, isIdle, isLoading, isSuccess, isError, sendTransaction } = useSendTransaction()

  //接收子组件传递过来的状态
  const tokenIdStatus = (status) => {
    setIdStatus(status)
  }
  //点击加号 显示要增加的tokenID
  const addTokenId = () => {
    console.log('--添加对象-', tokenObj)
    if (tokenObj.standard == 1 || tokenObj.standard == 2) {
      // erc721判断
      if (tokenObj.standard == 1) {
        if (Number(tokenObj.balance) <= 0 || listIdCard.length == Number(tokenObj.balance)) {
          message.error(t('toast-no-assets'))
          return
        }
      }

      const obj = {
        tokenStd: tokenObj.standard,
        tokenAddress: tokenObj.contract,
        tokenName: tokenObj.name,
        tokenSymbol: tokenObj.symbol,
        tokenImage: tokenObj.logo,
        tokenId: null, //需要获取输入的
        tokenBalance: tokenObj.balance,
        decimals: tokenObj.decimals,
        index: listIdCard.length, //这个用作删除的判断
      }
      const newArr = [...listIdCard]
      newArr.push(obj)
      setListIdCard(newArr)
    }
  }
  //删除tokenId
  const deleteTokenId = useCallback(
    (tempObj) => {
      console.log('删除了对象', tempObj, listIdCard)
      if (tokenObj.standard == 1 || tokenObj.standard == 2) {
        const arr = listIdCard.filter((a) => a.index != tempObj.index)
        setListIdCard(arr)
      }
    },
    [listIdCard]
  )

  //前往授权
  const goApprove = () => {
    //前往授权 write是触发这个方法
    //授权多少金额
    showLoading()
    if (tokenObj.standard == 0) {
      //erc20授权
      const approveAmount = BigInt(
        Number(inputTokenAmoutRef.current?.value) * Math.pow(10, Number(tokenObj.decimals))
      )
      write({
        args: [manageAddress, approveAmount],
      })
    } else if (tokenObj.standard == 1 || tokenObj.standard == 2) {
      // erc721授权
      write721({
        args: [manageAddress, true],
      })
    }
  }
  const checkApprove = async (token) => {
    //查询是否有权限，授权
    const allowceParams = {
      chain: 'bsc',
      tokenAddress: token.contract,
      ownerAddress: address as `0x${string}`,
      operatorAddress: manageAddress,
      tokenStd: token.standard,
      tokenIds: listIdCard.map((a) => a.tokenId),
      tokenBalances: [] as Number[],
    }
    if (token.standard == 0) {
      //如果是erc20
      allowceParams.tokenBalances.push(Number(inputTokenAmoutRef.current?.value))
    } else {
      //如果是erc721 erc1155
      allowceParams.tokenBalances = listIdCard.map((a) => a.tokenBalance)
    }
    try {
      const checkResult = await tokenAllowance(allowceParams)
      if (checkResult.data) {
        setApprove(true)
        if (token.standard == 1 || token.standard == 2) {
          //如果是erc721授权过了
          dispatch(increment([...listIdCard]))
          router.back()
        } else if (token.standard == 0) {
          //erc20
          setErc20NativeData(token)
        }
      } else {
        //没有权限则前往授权
        setApprove(false)
        goApprove()
      }
    } catch (error) {
      message.error(t('toast-approve-error'))
    }
  }

  //设置erc20和原生币 返回上一页
  const setErc20NativeData = (token) => {
    console.log('设置回调的token', token)
    const obj = {
      tokenStd: token.standard,
      tokenAddress: token.contract,
      tokenName: token.name,
      tokenSymbol: token.symbol,
      tokenImage: token.logo,
      tokenBalance: inputTokenAmoutRef.current?.value,
      decimals: token.decimals,
    }
    //先把数据存到redux，其他界面获取
    dispatch(increment([obj]))
    router.back()
  }
  //获取网络数据
  const searchGetNet = useCallback(async (inputValue) => {
    // 加载 API 数据,传入页码参数
    const parmas = {
      chain: 'bsc',
      addressOrSymbol: inputValue,
    }
    try {
      //查询token
      const result = await tokenFind(parmas)

      //设置显示token
      const { data } = result
      setTokenObj(data)
      //显示查询到的对象
      setIsShowCard(true)
      const balanceParams = {
        chain: 'bsc',
        tokenAddress: data.contract,
        ownerAddress: address as `0x${string}`,
      }
      //获取到余额
      const balanceResult = await tokenBalance(balanceParams)
      hideLoading()
      const balance = balanceResult.data
      setTokenObj((obj: any) => {
        obj.balance = balance
      })
    } catch (error) {
      hideLoading()
      message.error(t('toast-no-token'))
    }
  }, [])

  //点击搜索token
  const searchToken = useCallback(() => {
    console.log('输入的值是', inputTokenRef.current?.value)
    if (inputTokenRef.current?.value.trim().length == 0) {
      message.error(t('toast-no-tokenId'))
      return
    }
    //重置一些数据
    setListIdCard([])
    if (inputTokenAmoutRef.current) {
      inputTokenAmoutRef.current.value = ''
    }
    //发起请求
    showLoading()
    searchGetNet(inputTokenRef.current?.value)
  }, [inputTokenRef.current?.value])

  const cancelSelect = () => {
    router.back()
  }

  //点击添加token 返回上个界面
  const confirmToken = () => {
    if (tokenObj.standard == 0) {
      //erc20

      if (Number(inputTokenAmoutRef.current?.value) == 0) {
        message.error(t('toast-no-money'))
        return
      }
      if (Number(inputTokenAmoutRef.current?.value) > Number(tokenObj.balance)) {
        message.error(t('toast-no-balance'))
        return
      }
      checkApprove(tokenObj)
    } else if (tokenObj.standard == 1 || tokenObj.standard == 2) {
      //erc721
      if (listIdCard.length == 0) {
        message.error(t('toast-input-noassets'))
        return
      }
      //判断是否存在tokenId 输入一样的元素
      const tokenIds = listIdCard.map((item) => {
        return item.tokenId
      })
      const sameArr = tokenIds.filter((elem, index, arr) => arr.indexOf(elem) !== index)
      if (sameArr.length != 0) {
        message.error(t('toast-input-sameTokenId'))
        return
      }
      //先查询tokenId是否有效
      if (!idStatus) {
        //如果存在错误的tokenId
        message.error(t('toast-error-tokenId'))
        return
      }
      checkApprove(tokenObj)
    } else if (tokenObj.standard == 3) {
      //erc20 和 原生币情况
      if (Number(inputTokenAmoutRef.current?.value) == 0) {
        message.error(t('toast-no-money'))
        return
      }
      if (Number(inputTokenAmoutRef.current?.value) > Number(tokenObj.balance)) {
        message.error(t('toast-no-balance'))
        return
      }
      //原生币情况 则返回上一页
      setErc20NativeData(tokenObj)
    }
  }
  const inputHolder = t('input-token-placeholder')
  return (
    <div className="">
      <div className="flex flex-col m-4 rounded-lg bg-homeItemBgColor">
        <p className="m-2 text-2xl text-center text-white "> {t('choose-assets')}</p>
        <div className="flex items-center justify-center h-10 p-3 m-3 bg-white bg-opacity-25 rounded-full ">
          <input
            ref={inputTokenRef}
            className="flex-1 w-full px-2 text-white bg-transparent border-none shadow-none outline-none "
            placeholder={inputHolder}
          ></input>
          <SearchOutlined
            onClick={searchToken}
            className="mr-2 text-lg text-white"
            style={{ fontSize: '24px' }}
          />
        </div>
        <div className=" m-3 p-3 overflow-auto  border-0.5 border-white border-solid bg-tokenIdColor h-80 rounded-30 ">
          {isShowCard ? <TokenCard tokenObj={tokenObj} addTokenId={addTokenId} /> : null}
          {/* //点击加号 增加的721 tokenID界面 */}
          {isShowCard && tokenObj.standard == 1
            ? listIdCard.map((item, index) => {
                return (
                  <IdCard
                    tokenIdStatus={tokenIdStatus}
                    tokenItem={item}
                    deleteTokenId={deleteTokenId}
                    key={`${item}${index}`}
                  />
                )
              })
            : null}
          {/* //点击加号 增加的1155 tokenID界面 */}
          {isShowCard && tokenObj.standard == 2
            ? listIdCard.map((item, index) => {
                return (
                  <Id1155Card
                    tokenIdStatus={tokenIdStatus}
                    tokenItem={item}
                    deleteTokenId={deleteTokenId}
                    key={`${item}${index}`}
                  />
                )
              })
            : null}
          {/* 展示erc20和原生币 的输入金额 */}
          {isShowCard && (tokenObj.standard == 0 || tokenObj.standard == 3) ? (
            <InputAmout ref={inputTokenAmoutRef} />
          ) : null}
        </div>

        <div className="flex flex-row justify-around my-2">
          <Button
            onClick={cancelSelect}
            shape="round"
            color="white"
            className="w-40 h-8 m-2 text-white bg-white border-none bg-opacity-30 lg:w-96"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={confirmToken}
            shape="round"
            type="primary"
            className="w-40 h-8 m-2 border-none bg-gradient-to-r from-gradLeftColor to-gradRightColor lg:w-96"
          >
            {t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}

//erc20 和bnb 显示的输入框

const InputAmout = forwardRef((props, ref: ForwardedRef<HTMLInputElement>) => {
  const { t, i18n } = useTranslation()
  const inputHolder = t('input-token-amout-placeholder')
  return (
    <div className="flex flex-row items-center">
      <span className="m-2 text-white">Amount</span>
      <div className="flex items-center flex-1 h-10 bg-white bg-opacity-25 rounded-full">
        <input
          ref={ref}
          className="flex-1 w-full px-2 text-white bg-transparent border-none shadow-none outline-none "
          placeholder={inputHolder}
        ></input>
      </div>
    </div>
  )
})

export default SelectToken
