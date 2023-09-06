import HeaderNav from '@/components/headerNav'
import pageStyles from './index.module.scss'

export default function Layout({ children }) {
  return (
    <>
      <div className={pageStyles.home}>
        <HeaderNav />
        <div className={pageStyles.pageContent}>{children}</div>
      </div>
    </>
  )
}
