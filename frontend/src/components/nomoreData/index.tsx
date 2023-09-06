import { memo } from 'react'
import { useTranslation } from 'react-i18next'

function NoMoreData({ show = false }: { show?: boolean }) {
  const { t, i18n } = useTranslation()

  return (
    <div className="my-2" style={{ textAlign: 'center', display: show ? 'block' : 'none' }}>
      <span className="text-sm text-white">{t('toast-nomore-data')}~~</span>
    </div>
  )
}

export default memo(NoMoreData)
