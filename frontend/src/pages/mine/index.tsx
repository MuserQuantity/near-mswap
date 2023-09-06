import React, { CSSProperties } from 'react'
import { ConfigProvider, List, TabPaneProps, Tabs } from 'antd'
import type { TabsProps } from 'antd'
import MineList from '@/components/mineList'
import MineRequest from '@/components/mineRequest'
import styles from './index.module.scss'
import { useTranslation } from 'react-i18next'

// const onChange = (key: string) => {
//   console.log(key)
// }

function MineTab() {
  const { t, i18n } = useTranslation()
  const scrollContentStyle: CSSProperties = {
    borderTop: 'none',
    overflow: 'auto', // 内容高度超过容器高度时可以滚动
  }
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: t('my-list'),

      children: (
        <div style={scrollContentStyle} className="mt-10">
          <MineList />
        </div>
      ),
    },
    {
      key: '2',
      label: t('my-request'),
      children: (
        <div style={scrollContentStyle} className="mt-10">
          <MineRequest />
        </div>
      ),
    },
  ]
  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            colorPrimary: '#37C1FE',
            fontWeightStrong: 800,
            fontSize: 20,
            margin: 0,
            padding: 0,
            colorBorder: 'transparnet',
          },
        },
      }}
    >
      <div>
        <Tabs
          style={{ borderBottom: 'none' }}
          className={styles.customNav}
          tabBarStyle={{ position: 'inherit', color: '#fff', borderBottom: 'none' }}
          centered
          defaultActiveKey="1"
          items={items}
        ></Tabs>
      </div>
    </ConfigProvider>
  )
}

export default MineTab
