import { createSlice } from "@reduxjs/toolkit";

const initialState = []

const ProductsSlice = createSlice({
  name: "Products",
  initialState,
  reducers: {
    getProducts: async (state, action) => {
      return state = action.data
    }
  }
})

const { reducer, actions } = ProductsSlice;
export const {
  getProducts
} = actions;

export default reducer;
