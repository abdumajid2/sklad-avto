import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://68adba38a0b85b2f2cf46f40.mockapi.io", // ✅ вот так
  }),
  tagTypes: ["Products", "Product"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => "/goods",
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: "Product", id: p.id })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),

    getProductById: builder.query({
      query: (id) => `/goods/${id}`,
      providesTags: (r, e, id) => [{ type: "Product", id }],
    }),

    addProduct: builder.mutation({
  query: (body) => ({
    url: "/goods",
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  }),
  invalidatesTags: [{ type: "Products", id: "LIST" }],
}),

    updateProduct: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/goods/${id}`,
        method: "PUT", // ✅ для mockapi лучше PUT
        body: patch,
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Product", id: arg.id },
        { type: "Products", id: "LIST" },
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/goods/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;