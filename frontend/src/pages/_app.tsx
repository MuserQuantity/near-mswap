import type { AppProps } from 'next/app'
import Head from 'next/head'
import '@/common/styles/frame.scss'
import 'tailwindcss/tailwind.css'
import 'antd/dist/reset.css'
import '@rainbow-me/rainbowkit/styles.css'

import Layout from '@/components/layout'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { useEffect, useState } from 'react'

import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { argentWallet, trustWallet, ledgerWallet } from '@rainbow-me/rainbowkit/wallets'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { mainnet, polygon, bsc, bscTestnet, polygonMumbai } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { Spin } from 'antd'
import '../i18n/index'
import { useTranslation } from 'react-i18next'
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, bsc, bscTestnet, polygonMumbai],
  [publicProvider()]
)

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string
const { wallets } = getDefaultWallets({
  appName: 'Meta Swap',
  projectId,
  chains,
})

const demoAppInfo = {
  appName: 'Meta Swap',
}

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

function MyApp({ Component, pageProps }: AppProps) {
  const { t, i18n } = useTranslation()
  global.t = t
  // if (typeof window !== 'undefined') {
  //   const language =
  //     localStorage.getItem('lang') == null ? 'en' : (localStorage.getItem('lang') as string)
  //   i18n.changeLanguage(language)
  //   localStorage.setItem('lang', language)
  // }

  const [ready, setReady] = useState(false)
  useEffect(() => {
    console.log('启动')
    setReady(true)
  }, [])
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        ></meta>
        <title>Meta Swap</title>
      </Head>
      <Provider store={store}>
        {ready ? (
          <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider appInfo={demoAppInfo} chains={chains}>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </RainbowKitProvider>
          </WagmiConfig>
        ) : (
          <Spin />
        )}
      </Provider>
    </>
  )
}

export default MyApp
