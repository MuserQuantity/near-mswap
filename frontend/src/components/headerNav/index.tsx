import { Button } from 'antd'
import logo from '@/common/images/logo.png'
import { Image } from 'antd'
import Link from 'next/link'
import { EllipsisOutlined } from '@ant-design/icons'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { memo, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
function HeaderNav() {
  const [loading, setLoading] = useState(false)
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const label = isConnected ? 'Disconnect' : 'Connect Wallet'

  async function onOpen() {
    setLoading(true)
    await open()
    setLoading(false)
  }

  function onClick() {
    if (isConnected) {
      disconnect()
    } else {
      onOpen()
    }
  }
  return (
    <div className="fixed top-0 z-30 flex flex-row items-center justify-between w-full h-20 bg-black ">
      <div className="flex items-center justify-between w-full px-4">
        <Link href="/">
          <img className="w-10 h-10 lg:w-16 lg:h-16" src={logo.src} />
        </Link>

        <div className="flex flex-row items-center justify-end flex-1">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              return (
                <div
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
                        <Button
                          onClick={openConnectModal}
                          type="primary"
                          color="white"
                          className="m-2 border-none bg-gradient-to-r from-gradLeftColor to-gradRightColor"
                        >
                          connect wallet
                        </Button>
                      )
                    }

                    if (chain.unsupported) {
                      return (
                        <Button
                          onClick={openChainModal}
                          type="primary"
                          color="white"
                          className="m-2 bg-gradient-to-r from-gradLeftColor to-gradRightColor"
                        >
                          Wrong network
                        </Button>
                      )
                    }

                    return (
                      <div
                        className="flex items-center justify-center"
                        style={{ display: 'flex', gap: 12 }}
                      >
                        <div
                          className="flex flex-row text-white"
                          onClick={openChainModal}
                          style={{ display: 'flex', alignItems: 'center' }}
                        >
                          {chain.hasIcon && (
                            <div
                              className="flex items-center justify-center w-10 h-10 lg:w-16 lg:h-16"
                              style={{
                                background: chain.iconBackground,

                                borderRadius: 999,
                                overflow: 'hidden',
                                marginRight: 4,
                                pointerEvents: 'none',
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt=""
                                  src={chain.iconUrl}
                                  className="w-10 h-10 lg:w-16 lg:h-16"
                                />
                              )}
                            </div>
                          )}
                          {/* <span className="flex-1 text-sm line-clamp-1">{chain.name}</span> */}
                        </div>
                        <div className="flex flex-row items-center px-2 h-10  border-0.5 border-solid border-white rounded-full bg-cardItemBgColor">
                          <Link href="/mine">
                            <span className="text-sm text-white">
                              {account.displayName}
                              {account.displayBalance ? ` (${account.displayBalance})` : ''}
                            </span>
                          </Link>
                          <EllipsisOutlined
                            onClick={openAccountModal}
                            style={{ color: '#fff', fontSize: '32px' }}
                          />
                        </div>
                        {/* <button type="button"></button> */}
                      </div>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </div>
  )
}

export default memo(HeaderNav)
