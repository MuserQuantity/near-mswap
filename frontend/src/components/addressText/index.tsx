//控制展示的地址文字缩写
function AddressText({ addressOrTx, color = 'rgba(255,255,255,0.4)' }) {
  console.log('AddressText 渲染')
  if (!addressOrTx) {
    return null
  }
  const truncatedStr = addressOrTx.slice(0, 6) + '...' + addressOrTx.slice(-6)
  return (
    <span style={{ color: color }} className="text-base truncate ">
      {truncatedStr}
    </span>
  )
}

export default AddressText
