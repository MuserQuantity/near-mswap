import successIcon from '@/common/images/icon/icon-success.png'
import cancelIcon from '@/common/images/icon/icon-cancel.png'
import { useTranslation } from 'react-i18next'

function StatusShow({ status }) {
  const { t, i18n } = useTranslation()
  console.log('StatusShow小组件渲染了')
  const statusShow = (status) => {
    switch (status) {
      case 0:
        return ''

      case 1:
        return t('common-tx-close')

      case 2:
        return t('common-tx-success')
    }
  }

  return (
    <div
      style={{ display: status != 0 ? 'flex' : 'none' }}
      className="absolute top-0 right-0 flex flex-row items-center justify-center px-6 py-1 rounded-tr-30 rounded-bl-30 bg-homeItemRightBgColor"
    >
      <img src={status == 2 ? successIcon.src : cancelIcon.src} width={32} height={32} />
      <span className="ml-1 text-sm text-white">{statusShow(status)}</span>
    </div>
  )
}

export default StatusShow
