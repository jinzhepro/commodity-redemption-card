/**
 * 兑换码相关的 endpoints 定义
 * @param {Object} builder - RTK Query 的 endpoint builder
 * @returns {Object} 兑换码相关的 endpoints 对象
 */
export const redeemCodeEndpoints = (builder) => ({
  // 验证兑换码
  verifyRedeemCode: builder.mutation({
    query: (data) => ({
      url: "/redeem-codes/verify",
      method: "POST",
      body: data,
    }),
  }),

  // 生成兑换码
  generateRedeemCodes: builder.mutation({
    query: (data) => ({
      url: "/redeem-codes",
      method: "POST",
      body: data,
    }),
    invalidatesTags: (result, error, data) => [
      "RedeemCode",
      "Product",
      { type: "Product", id: data.productId },
      { type: "Product", id: "LIST" },
    ],
  }),

  // 获取兑换码列表
  getRedeemCodes: builder.query({
    query: () => "/redeem-codes",
    providesTags: ["RedeemCode"],
  }),

  // 按商品ID获取兑换码列表
  getRedeemCodesByProduct: builder.query({
    query: (productId) => `/redeem-codes?productId=${productId}`,
    providesTags: (result, error, productId) => [
      "RedeemCode",
      { type: "RedeemCode", id: productId },
    ],
  }),

  // 删除兑换码
  deleteRedeemCode: builder.mutation({
    query: (id) => ({
      url: `/redeem-codes/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: (result, error, id) => [
      "RedeemCode",
      "Product",
      { type: "RedeemCode", id },
      { type: "Product", id: "LIST" },
    ],
  }),
});