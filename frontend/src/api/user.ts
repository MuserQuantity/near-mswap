import myAxios from './http'

export function login(paramsList: any) {
  return myAxios({
    url: '/api/login',
    method: 'post',
    data: paramsList,
  })
}

export function test(paramsList: any) {
  return myAxios({
    url: '/xlive/web-interface/v1/webMain/getMoreRecList',
    method: 'get',
    params: paramsList,
  })
}
