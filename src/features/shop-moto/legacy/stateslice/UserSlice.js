import { createSlice } from "@reduxjs/toolkit";

const initialState = {}

const UserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUserInfo: (state, action) => {
      const { user } = action.payload;
      if (!user) return null
      return state = user
    },
    addUserFormCheckOut: (state, action) => {
      const { formData } = action.payload;
      if (!formData) return null
      return state = formData
    },
    removeUserInfo: (state, action) => {
      return state = null
    }
  }
})

const { reducer, actions } = UserSlice;
export const {
  addUserInfo,
  removeUserInfo
} = actions

export default reducer;
