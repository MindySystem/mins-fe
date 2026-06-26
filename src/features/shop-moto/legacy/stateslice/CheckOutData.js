import { createSlice } from "@reduxjs/toolkit";

const initialState = {}

const CheckOutDataSlice = createSlice({
  name: 'form_data',
  initialState,
  reducers: {
    addFormCheckOut: (state, action) => {
      const { formData } = action.payload;
      if (!formData) return null
      return state = formData
    },
    removeFormCheckOut: (state, action) => {
      return state = null
    }
  }
})

const { reducer, actions } = CheckOutDataSlice;
export const {
  addFormCheckOut,
  removeFormCheckOut
} = actions

export default reducer;
