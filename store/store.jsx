import { configureStore } from "@reduxjs/toolkit";
import { productsApi } from "./services/productsApi";
import { usersApi } from "./services/userApi";
import { sotrudnikiApi } from "./services/sotrudnikiApi";

export const store = configureStore({
  reducer: {
    [productsApi.reducerPath]: productsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [sotrudnikiApi.reducerPath]: sotrudnikiApi.reducer,
  },
  middleware: (gdm) => gdm().concat(productsApi.middleware, usersApi.middleware, sotrudnikiApi.middleware),
});