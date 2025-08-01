import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * 基础 API 配置
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
  }),
  tagTypes: ['Product', 'RedeemCode', 'Order'],
  endpoints: () => ({}),
});

/**
 * 创建模块化 API 的辅助函数
 * @param {string} reducerPath - API 的 reducer 路径
 * @param {string} baseUrl - API 的基础 URL
 * @param {string[]} tagTypes - 标签类型数组
 * @param {Function} endpoints - endpoints 定义函数
 * @returns {Object} 创建的 API 实例
 */
export const createModuleApi = (
  reducerPath,
  baseUrl,
  tagTypes,
  endpoints
) => {
  return createApi({
    reducerPath,
    baseQuery: fetchBaseQuery({
      baseUrl,
    }),
    tagTypes,
    endpoints,
  });
};