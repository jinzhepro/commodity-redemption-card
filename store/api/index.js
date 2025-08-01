/**
 * API 模块统一导出
 */

// 基础配置
export { baseApi, createModuleApi } from "./base";

// API 模块
export { productApi } from "./product";
export { redeemCodeApi } from "./redeemCode";
export { orderApi } from "./order";

// Hooks 导出
export {
  useCreateProductMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "./product";

export {
  useVerifyRedeemCodeMutation,
  useGenerateRedeemCodesMutation,
  useGetRedeemCodesQuery,
  useGetRedeemCodesByProductQuery,
  useDeleteRedeemCodeMutation,
} from "./redeemCode";

export {
  useCreateOrderMutation,
  useGetAllOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useQueryOrderMutation,
  useTrackLogisticsMutation,
} from "./order";