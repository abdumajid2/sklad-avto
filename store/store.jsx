import { configureStore } from "@reduxjs/toolkit";
import { productsApi } from "./services/productsApi";
import { usersApi } from "./services/userApi";

export const store = configureStore({
  reducer: {
    [productsApi.reducerPath]: productsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (gdm) => gdm().concat(productsApi.middleware, usersApi.middleware),
});