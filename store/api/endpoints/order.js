/**
 * 订单相关的 endpoints 定义
 * @param {Object} builder - RTK Query 的 endpoint builder
 * @returns {Object} 订单相关的 endpoints 对象
 */
export const orderEndpoints = (builder) => ({
  // 创建订单
  createOrder: builder.mutation({
    query: (data) => ({
      url: '/orders',
      method: 'POST',
      body: data,
    }),
    invalidatesTags: ['Order'],
  }),

  // 查询订单
  queryOrder: builder.mutation({
    query: (data) => ({
      url: '/orders/query',
      method: 'POST',
      body: data,
    }),
  }),

  // 获取所有订单
  getAllOrders: builder.query({
    query: () => '/orders',
    providesTags: ['Order'],
  }),

  // 更新订单
  updateOrder: builder.mutation({
    query: ({ id, ...data }) => ({
      url: `/orders/${id}`,
      method: 'PATCH',
      body: data,
    }),
    invalidatesTags: ['Order'],
  }),

  // 查询物流信息
  trackLogistics: builder.mutation({
    query: (data) => ({
      url: '/logistics/track',
      method: 'POST',
      body: data,
    }),
  }),
});