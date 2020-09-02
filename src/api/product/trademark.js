import request from '@/utils/request'

export default {
  /*
    DELETE /admin/product/baseTrademark/remove/{id}
    删除BaseTrademark

    POST /admin/product/baseTrademark/save
    新增BaseTrademark

    PUT /admin/product/baseTrademark/update
    修改BaseTrademark

    GET /admin/product/baseTrademark/{page}/{limit}
    分页列表
  */
  delete(id) {
    return request.delete(`/admin/product/baseTrademark/remove/${id}`)
  },
  addOrUpdate(trademark) {
    if (trademark.id) {
      return request.put(`/admin/product/baseTrademark/update`, trademark)
    } else {
      return request.post(`/admin/product/baseTrademark/save`, trademark)
    }
  },
  reqbaseTrademark(page, limit) {
    return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
  },
  // GET /admin/product/baseTrademark/getTrademarkList
  reqTrademarkList() {
    return request.get('/admin/product/baseTrademark/getTrademarkList')
  }
}
