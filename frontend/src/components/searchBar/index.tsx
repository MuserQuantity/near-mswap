function SearchBar({ filterText, inStockOnly }) {
  return (
    <form>
      <input type="text" value={filterText} placeholder="输入搜索的值"></input>
    </form>
  )
}

export default SearchBar
