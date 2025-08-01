import { createModuleApi } from "./base";
import { orderEndpoints } from "./endpoints/order";

/**
 * 订单 API 模块
 */
export const orderApi = createModuleApi(
  "orderApi",
  "/api",
  ["Order"],
  orderEndpoints
);

// 导出 hooks
export const {
  useCreateOrderMutation,
  useQueryOrderMutation,
  useGetAllOrdersQuery,
  useUpdateOrderMutation,
  useTrackLogisticsMutation,
} = orderApi;