import { createModuleApi } from "./base";
import { redeemCodeEndpoints } from "./endpoints/redeemCode";

/**
 * 兑换码 API 模块
 */
export const redeemCodeApi = createModuleApi(
  "redeemCodeApi",
  "/api",
  ["RedeemCode"],
  redeemCodeEndpoints
);

// 导出 hooks
export const {
  useVerifyRedeemCodeMutation,
  useGenerateRedeemCodesMutation,
  useGetRedeemCodesQuery,
  useGetRedeemCodesByProductQuery,
  useDeleteRedeemCodeMutation,
} = redeemCodeApi;