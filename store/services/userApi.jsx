import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://68adba38a0b85b2f2cf46f40.mockapi.io",
  }),
  tagTypes: ["UserLogs"],
  endpoints: (builder) => ({
    // История по товару
    getLogsByGood: builder.query({
      query: (goodId) => `/users?goodId=${goodId}&sortBy=createdAt&order=desc`,
      providesTags: (r, e, goodId) => [{ type: "UserLogs", id: goodId }],
    }),

    // Добавить запись (выдача/бронь/возврат)
    addLog: builder.mutation({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (r, e, arg) => [{ type: "UserLogs", id: arg.goodId }],
    }),
  }),
});

export const { useGetLogsByGoodQuery, useAddLogMutation } = usersApi;