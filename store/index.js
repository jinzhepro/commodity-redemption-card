import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { productApi } from "./api/product";
import { orderApi } from "./api/order";
import { redeemCodeApi } from "./api/redeemCode";

/**
 * Redux store配置
 */
export const store = configureStore({
  reducer: {
    [productApi.reducerPath]: productApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [redeemCodeApi.reducerPath]: redeemCodeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      productApi.middleware,
      orderApi.middleware,
      redeemCodeApi.middleware
    ),
});

setupListeners(store.dispatch);
