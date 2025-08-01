/**
 * 商品相关的 endpoints 定义
 * @param {Object} builder - RTK Query 的 endpoint builder
 * @returns {Object} 商品相关的 endpoints 对象
 */
export const productEndpoints = (builder) => ({
  // 创建商品
  createProduct: builder.mutation({
    query: (product) => ({
      url: "/products",
      method: "POST",
      body: product,
    }),
    invalidatesTags: ["Product"],
  }),

  // 获取所有商品
  getProducts: builder.query({
    query: () => "/products",
    providesTags: ["Product"],
  }),

  // 获取单个商品
  getProduct: builder.query({
    query: (id) => `/products/${id}`,
    providesTags: (result, error, id) => [{ type: "Product", id }],
  }),

  // 更新商品
  updateProduct: builder.mutation({
    query: ({ id, data }) => ({
      url: "/products",
      method: "PUT",
      body: { id, ...data },
    }),
    invalidatesTags: ["Product"],
  }),

  // 删除商品
  deleteProduct: builder.mutation({
    query: (id) => ({
      url: `/products/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["Product"],
  }),

  // 更新商品兑换码统计
  updateProductRedeemCodeCount: builder.mutation({
    query: (data) => ({
      url: "/products/redeem-code-count",
      method: "PUT",
      body: data,
    }),
    invalidatesTags: ["Product"],
  }),
});
