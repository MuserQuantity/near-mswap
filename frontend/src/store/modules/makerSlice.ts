import { createSlice, PayloadAction } from '@reduxjs/toolkit'
interface INotificationState {
  makerData: any
}

// 定义初始化数据
const initialState: INotificationState = { makerData: null }

// 定义一个切片
const makerSlice = createSlice({
  name: 'makerAddData',
  initialState,
  reducers: {
    // 定义一个数字递增的actions action.type为 上面的定义的name/和该对象的方法名// 即action.type=makerAddData/setMakerData// 在这里一般都是使用同步的
    //增加数据

    setMakerData: (state, action: PayloadAction<any[]>) => {
      state.makerData = action.payload
    },
    //重置数据
    resetMakerData: (state, action) => {
      console.log('重置数据了')
      state.makerData = null
    },
  },
})

// 导出该action
export const { setMakerData, resetMakerData } = makerSlice.actions

// 默认导出,到处的文件需要在store入口文件引入
export default makerSlice.reducer
