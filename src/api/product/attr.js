import request from '@/utils/request'

export default {
  /*
    GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
    attrInfoList

    DELETE /admin/product/deleteAttr/{attrId}
    deleteAttr

    POST /admin/product/saveAttrInfo
    saveAttrInfo
  */
  getList(category1Id, category2Id, category3Id) {
    return request.get(`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)
  },
  delete(attrId) {
    return request.delete(`/admin/product/deleteAttr/${attrId}`)
  },
  addOrUpdate(attrInfo) {
    return request.post(`/admin/product/saveAttrInfo`, attrInfo)
  },

}
