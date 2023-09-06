import { Button } from 'antd'
import { useRouter } from 'next/router'
import { resetTokenList } from '@/store/modules/tokenSlice'
import { useAppDispatch } from '@/store'
import React, { useState, useEffect, memo } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useTranslation } from 'react-i18next'

function BottomNav() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isHidden, setIsHidden] = useState(false)
  const { isConnected } = useAccount()
  const { connect } = useConnect()
  useEffect(() => {
    let prevScrollY = window.scrollY

    const handleScroll = () => {
      // console.log('监听到滑动')
      const currentScrollY = window.scrollY
      if (currentScrollY > prevScrollY) {
        setIsHidden(true) // 往下滑动，隐藏组件
      } else {
        setIsHidden(false) // 往上滑动，显示组件
      }
      prevScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const goCreateSwap = () => {
    if (isConnected) {
      dispatch(resetTokenList(1))
      router.push('/createSwap')
    } else {
      connect()
    }
  }
  return (
    <div
      className="fixed bottom-0 z-50 w-full bg-black h-14"
      style={{ display: isHidden ? 'none' : 'block' }}
    >
      <div className="flex items-center justify-center w-full">
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            return (
              <div
                className="flex items-center justify-center w-full"
                {...(!mounted && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!mounted || !account || !chain) {
                    return (
                      <div className="flex items-center justify-center w-full">
                        <Button
                          onClick={openConnectModal}
                          shape="round"
                          type="primary"
                          color="red"
                          className="w-3/4 h-10 m-2 text-lg font-bold bg-gradient-to-r from-gradLeftColor to-gradRightColor lg:w-96"
                        >
                          {isConnected ? t('swap-create') : t('connect-wallet')}
                        </Button>
                      </div>
                    )
                  }

                  if (chain.unsupported) {
                    return (
                      <div className="flex items-center justify-center w-full">
                        <Button
                          onClick={openChainModal}
                          shape="round"
                          type="primary"
                          color="red"
                          className="w-3/4 h-10 m-2 text-lg font-bold bg-gradient-to-r from-gradLeftColor to-gradRightColor lg:w-96"
                        >
                          Wrong network
                        </Button>
                      </div>
                    )
                  }

                  return (
                    <div className="flex items-center justify-center w-full">
                      <Button
                        onClick={goCreateSwap}
                        shape="round"
                        type="primary"
                        color="red"
                        className="w-3/4 h-10 m-2 text-lg font-bold bg-gradient-to-r from-gradLeftColor to-gradRightColor lg:w-96"
                      >
                        {isConnected ? t('swap-create') : t('connect-wallet')}
                      </Button>
                    </div>
                  )
                })()}
              </div>
            )
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  )
}

export default memo(BottomNav)
