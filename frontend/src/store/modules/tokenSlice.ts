import { createSlice, PayloadAction } from '@reduxjs/toolkit'
interface INotificationState {
  tokenData: any[]
}

// 定义初始化数据
const initialState: INotificationState = { tokenData: [] }

// 定义一个切片
const tokenSlice = createSlice({
  name: 'tokenAddData',
  initialState,
  reducers: {
    // 定义一个数字递增的actions action.type为 上面的定义的name/和该对象的方法名// 即action.type=tokenAddData/increment// 在这里一般都是使用同步的
    //增加数据
    increment: (state, action: PayloadAction<any[]>) => {
      const { tokenData } = state
      //过滤重复数据
      const newData = action.payload
      console.log('收到添加的数据', newData, action)
      let findNativeObj = tokenData.find((token) => token.tokenStd == 3)
      const erc20Data = tokenData.filter((token) => token.tokenStd == 0)
      const erc721Data = tokenData.filter((token) => token.tokenStd == 1)
      const erc1155Data = tokenData.filter((token) => token.tokenStd == 2)
      newData.forEach((item, index) => {
        if (item.tokenStd == 3) {
          //原生币
          if (findNativeObj) {
            findNativeObj.tokenBalance = item.tokenBalance
            //移除掉数组里的
            newData.splice(0, 1)
            console.log('移除后数据', newData)
          }
        } else if (item.tokenStd == 0) {
          // erc20
          const erc20Obj = erc20Data.find((token) => token.tokenAddress == item.tokenAddress)
          if (erc20Obj) {
            //如果存在相同的，则覆盖这一个
            erc20Obj.tokenBalance = item.tokenBalance
            erc20Data.splice(0, 1)
          }
        } else if (item.tokenStd == 1) {
          // erc721
          const erc721Obj = erc721Data.find(
            (token) => token.tokenAddress == item.tokenAddress && item.tokenId == token.tokenId
          )
          if (erc721Obj) {
            //如果存在相同的，移除这一个
            const findIndex = erc721Data.findIndex(
              (findToken) =>
                findToken.tokenAddress == erc721Obj.tokenAddress &&
                erc721Obj.tokenId == findToken.tokenId
            )
            erc721Data.splice(findIndex, 1)
          }
        } else if (item.tokenStd == 2) {
          // erc721
          const erc1155Obj = erc1155Data.find(
            (token) => token.tokenAddress == item.tokenAddress && item.tokenId == token.tokenId
          )
          console.log('存在相同的1155', erc1155Obj)
          if (erc1155Obj) {
            //如果存在相同的，移除这一个
            const findIndex = erc1155Data.findIndex(
              (findToken) =>
                findToken.tokenAddress == erc1155Obj.tokenAddress &&
                erc1155Obj.tokenId == findToken.tokenId
            )
            erc1155Data.splice(findIndex, 1)
          }
        }
      })
      //设置新数组

      if (findNativeObj) {
        const newResult = [...erc20Data, ...erc721Data, ...erc1155Data, ...newData, findNativeObj]
        console.log('--newResult', newResult, newData)
        state.tokenData = newResult
      } else {
        const newResult = [...erc20Data, ...erc721Data, ...erc1155Data, ...newData]
        state.tokenData = newResult
      }
    },
    setNewData: (state, action: PayloadAction<any[]>) => {
      state.tokenData = action.payload
    },
    //重置数据
    resetTokenList: (state, action) => {
      console.log('重置数据了')
      state.tokenData = []
    },
  },
})

// 导出该action
export const { increment, resetTokenList, setNewData } = tokenSlice.actions

// 默认导出,到处的文件需要在store入口文件引入
export default tokenSlice.reducer
