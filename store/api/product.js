import { createModuleApi } from "./base";
import { productEndpoints } from "./endpoints/product";

/**
 * 商品 API 模块
 */
export const productApi = createModuleApi(
  "productApi",
  "/api",
  ["Product"],
  productEndpoints
);

// 导出 hooks
export const {
  useCreateProductMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateProductRedeemCodeCountMutation,
} = productApi;