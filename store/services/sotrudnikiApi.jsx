import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase";

export const sotrudnikiApi = createApi({
  reducerPath: "sotrudnikiApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Sotrudniki", "Sotrudnik"],
  endpoints: (builder) => ({
    getSotrudniki: builder.query({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("sotrudniki")
          .select("id, name, age, job, created_at, avatar")
          .order("created_at", { ascending: false });

        if (error) return { error: { message: error.message } };
        return { data };
      },
      providesTags: ["Sotrudniki"],
    }),

    addSotrudnik: builder.mutation({
      queryFn: async (newSotrudnik) => {
        const { data, error } = await supabase
          .from("sotrudniki")
          .insert([newSotrudnik])
          .select("id, name, age, job, created_at, avatar")
          .single();

        if (error) return { error: { message: error.message } };
        return { data };
      },
      invalidatesTags: ["Sotrudniki"],
    }),

    updateSotrudnik: builder.mutation({
      queryFn: async ({ id, ...payload }) => {
        const { data, error } = await supabase
          .from("sotrudniki")
          .update(payload)
          .eq("id", id)
          .select("id, name, age, job, created_at, avatar")
          .single();

        if (error) return { error: { message: error.message } };
        return { data };
      },
      invalidatesTags: ["Sotrudniki"],
    }),

    deleteSotrudnik: builder.mutation({
      queryFn: async (id) => {
        const { error } = await supabase
          .from("sotrudniki")
          .delete()
          .eq("id", id);

        if (error) return { error: { message: error.message } };
        return { data: { id } };
      },
      invalidatesTags: ["Sotrudniki"],
    }),
  }),
});

export const {
  useGetSotrudnikiQuery,
  useAddSotrudnikMutation,
  useUpdateSotrudnikMutation,
  useDeleteSotrudnikMutation,
} = sotrudnikiApi;