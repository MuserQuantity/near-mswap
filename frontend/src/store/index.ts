import { configureStore } from '@reduxjs/toolkit'

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'

// 引入每一个reducer
import tokenAddData from './modules/tokenSlice'

export const store = configureStore({
  reducer: { tokenAddData }, // 配置中间件// RTk已经默认使用了redux-thunk,这里不需要额外引入了// 如果需要一些自定义的中间件,可以通过调用getDefaultMiddleware// 并将结果包含在返回的中间件数组中// 案例中使用了日志的中间件,可以追踪到哪个页面在哪个时候使用了该reducer// 并且可以显示调用前的数据状态和调用后的数据状态middleware: (getDefaultMiddleware) => getDefaultMiddleware({}).concat(logger),
})

// 全局定义 dispatch和state的类型,并导出
// 后面使用过程中直接从该文件中引入,而不需要冲react-redux包中引入
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
