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
          .select("id,name,age,job,created_at,avatar")
          .order("created_at", { ascending: false });

        if (error) return { error: { message: error.message } };
        return { data };
      },
      providesTags: ["Sotrudniki"],
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

    addSotrudnik: builder.mutation({
      queryFn: async (newSotrudnik) => {
        const { data, error } = await supabase
          .from("sotrudniki")
          .insert([newSotrudnik]) // ✅ массив
          .select("id,name,age,job,created_at,avatar")
          .single();

        if (error) return { error: { message: error.message } };
        return { data };
      },
      invalidatesTags: ["Sotrudniki"], // ✅ авто-обновление списка
    }),
  }),
});

export const {
  useGetSotrudnikiQuery,
  useAddSotrudnikMutation,
  useDeleteSotrudnikMutation,
} = sotrudnikiApi;
